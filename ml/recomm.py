import traceback
import json
from fastapi import FastAPI, HTTPException,Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import pandas as pd
import numpy as np
from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import pickle
import google.generativeai as genai
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# --- Load Environment Variables ---
load_dotenv()
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')

# --- Global Variables for Data ---
df = None
rating_matrix = None
recommender = None
hotel = None

# --- Gemini API Configuration ---
genai.configure(api_key=GOOGLE_API_KEY)
generation_config = {
    "temperature": 0.5,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}
model = genai.GenerativeModel(
    model_name="gemini-pro",
    generation_config=generation_config,
)

# --- FastAPI App Initialization ---
app = FastAPI()

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://manzafir-wl2h.onrender.com",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Exception Handler ---
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    print("--- Unhandled Exception ---")
    traceback.print_exc()
    print("---------------------------")
    return JSONResponse(
        status_code=500,
        content={"message": "An internal server error occurred."},
    )

# --- Startup Event to Load Models ---
@app.on_event("startup")
async def load_data():
    global df, rating_matrix, recommender, hotel
    try:
        with open('hotel/hotel.pkl', 'rb') as f:
            hotel = pickle.load(f)
        print('Hotel data loaded...')

        with open('food/df.pkl', 'rb') as f:
            df = pickle.load(f)
        print('df loaded...')
        
        with open('food/rating_matrix.pkl', 'rb') as f:
            rating_matrix = pickle.load(f)
        print('rating_matrix loaded...')
        
        with open('food/recommender.pkl', 'rb') as f:
            recommender = pickle.load(f)
        print('recommender loaded...')
    except Exception as e:
        print(f"Error loading pickle files: {e}")
        raise HTTPException(status_code=500, detail="Failed to load data")

# --- Pydantic Models for Request Bodies ---
class FoodRecommendationRequest(BaseModel):
    title: str

class HotelRecommendationRequest(BaseModel):
    city: str
    number_of_guests: int
    features: str

class TravelRequest(BaseModel):
    budget: str
    starting_location: str
    group_size: int
    preference_type: str

# --- Helper Functions ---
def Get_Food_Recommendations(title: str):
    user = df[df['Name'] == title]
    if user.empty:
        raise HTTPException(status_code=404, detail="Food not found")
    user_index = np.where(rating_matrix.index == int(user['Food_ID']))[0][0]
    user_ratings = rating_matrix.iloc[user_index]
    reshaped = user_ratings.values.reshape(1, -1)
    distances, indices = recommender.kneighbors(reshaped, n_neighbors=16)
    nearest_neighbors_indices = rating_matrix.iloc[indices[0]].index[1:]
    nearest_neighbors = pd.DataFrame({'Food_ID': nearest_neighbors_indices})
    result = pd.merge(nearest_neighbors, df, on='Food_ID', how='left')
    return result[['Name']].head().to_dict(orient='records')

def requirementbased(city, number, features):
    hotel['city'] = hotel['city'].str.lower()
    hotel['roomamenities'] = hotel['roomamenities'].str.lower()
    features = features.lower()
    features_tokens = word_tokenize(features)
    sw = stopwords.words('english')
    lemm = WordNetLemmatizer()
    f1_set = {w for w in features_tokens if w not in sw}
    f_set = set(lemm.lemmatize(se) for se in f1_set)
    reqbased = hotel[hotel['city'] == city.lower()]
    reqbased = reqbased[reqbased['guests_no'] == number]
    reqbased = reqbased.set_index(np.arange(reqbased.shape[0]))
    cos = []
    for i in range(reqbased.shape[0]):
        temp_tokens = word_tokenize(reqbased['roomamenities'][i])
        temp1_set = {w for w in temp_tokens if w not in sw}
        temp_set = set(lemm.lemmatize(se) for se in temp1_set)
        rvector = temp_set.intersection(f_set)
        cos.append(len(rvector))
    reqbased['similarity'] = cos
    reqbased = reqbased.sort_values(by='similarity', ascending=False)
    reqbased.drop_duplicates(subset='hotelcode', keep='first', inplace=True)
    return reqbased[['hotelname', 'roomtype', 'guests_no', 'starrating', 'address', 'roomamenities', 'ratedescription']].head(5)

def clean_json_response(response: str):
    """Removes markdown JSON formatting from the response."""
    cleaned_response = response.replace("```json", "").replace("```", "").strip()
    return cleaned_response

# --- API Endpoints ---
@app.post("/food_recommendations/")
async def get_food_recommendations(request: FoodRecommendationRequest):
    recommendations = Get_Food_Recommendations(request.title)
    return {"recommendations": recommendations}

@app.post("/hotel_recommendations/")
async def get_hotel_recommendations(request: HotelRecommendationRequest):
    recommendations = requirementbased(request.city, request.number_of_guests, request.features)
    return {"recommendations": recommendations.to_dict(orient="records")}

@app.post("/recommend_travel")
async def recommend_travel(request: TravelRequest):
    cleaned_text = ""
    try:
        prompt = f"""
        Provide multiple travel recommendations in strict JSON format based on the following details:
        - Budget: {request.budget}
        - Starting Location: {request.starting_location}
        - Group Size: {request.group_size}
        - Preference Type: {request.preference_type}

        IMPORTANT: Do not include ```json or ``` markers in the response.
        Return ONLY the raw JSON array of objects, without any surrounding text or explanations.
        The required JSON structure is:
        [
            {{
                "recommended_destinations": {{"name": "string", "description": "string", "highlights": ["string"]}},
                "estimated_costs": {{"flights": "integer", "accommodation": "integer", "daily_expenses": "integer", "total_cost": "integer", "currency": "INR"}},
                "accommodation": [{{ "type": "string", "price_range": "string", "suggested_options": ["string"]}}],
                "travel_logistics": {{"recommended_transport": "string", "travel_duration": "string", "visa_requirements": "string", "local_transportation": "string"}},
                "best_time_to_visit": {{"recommended_months": ["string"], "weather": "string", "peak_season": "string", "off_peak_season": "string"}}
            }}
        ]
        """
        chat_session = model.start_chat(history=[])
        response = chat_session.send_message(prompt)
        
        cleaned_text = clean_json_response(response.text)
        json_data = json.loads(cleaned_text)
        
        return {"recommendation": json_data}

    except json.JSONDecodeError:
        print("--- JSON DECODE ERROR in /recommend_travel ---")
        print(f"Failed to parse Gemini response: {cleaned_text}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to parse recommendation data from the model.")
    except Exception as e:
        print(f"--- ERROR IN /recommend_travel ---")
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Details: {e}")
        traceback.print_exc()
        print("------------------------------------")
        raise HTTPException(status_code=500, detail=str(e))

# --- Main Entry Point ---
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

