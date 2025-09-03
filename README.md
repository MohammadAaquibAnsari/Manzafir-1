# 🌍 Manzafir - Travel With People Like You

**Manzafir** is a web-based travel platform designed to simplify and enrich travel experiences for Gen Z explorers and family vacationers. With curated travel packages, intelligent matchmaking, personalized itineraries, and a socially interactive interface, Manzafir redefines how users plan and enjoy trips.

---

## 🚀 Features

- 🧠 **Smart Travel Matching**: Connects users with potential travel companions based on preferences and past interactions.
- 🧳 **Custom Tours**: Allows users to create and manage their own tours.
- 🗺️ **Curated Packages**: View and join trips curated by other users.
- 💬 **Blog and Stories**: Travel stories and feedback shared by users.
- 📸 **User Profiles**: Detailed profiles with bio, tour history, followers, and matching features.
- 🔐 **Secure Login**: Currently with JWT + MongoDB. **(Firebase Auth coming soon)**

---

## 🛠️ Tech Stack

### Frontend:
- React.js + TailwindCSS
- React Router
- Framer Motion
- React Icons

### Backend:
- Node.js
- Express.js
- MongoDB + Mongoose

### Machine Learning:
- uvicorn

### Other:
- Multer (image uploads)
- Nodemailer (contact form)
- JWT (Authentication)
- GitHub & Git LFS (versioning)
- 📌 *Firebase Authentication planned for future versions*

---

## 📦 Project Structure

```

/client             → React frontend
/api                → Express backend
/api/models         → Mongoose Schemas (User, Tour, Match)
/api/routes         → REST API endpoints
/api/middleware     → Auth middleware (JWT based)

````

---


## ⚙️ Installation (Local Development)

### 1. Clone the Repo

```bash
git clone https://github.com/NandanAdi/Manzafir-travel.git
cd Manzafir-travel
````

### 2. Backend Setup

```bash
cd api
npm install
npm start
```

Create a `.env` file inside `/api/` with:

```env
MONGO_URI=<your-mongodb-connection-string>
EMAIL_USER=<your-email>
EMAIL_PASS=<your-password>
PORT=5000
```
### 3. ML Setup

```bash
cd ml
python -m uvicorn recomm:app --reload
```

### 4. Frontend Setup

```bash
cd client
npm install
npm star

## 📷 Sample Screenshots

* ✅ User Profile Page
* ✅ Tour Listings
* ✅ Smart Chat Support Bot
* ✅ Blog Page with Testimonials
  *(See `screenshots/` folder for images)*

---

## ✅ Future Improvements

* 🔒 Firebase Authentication( will be implementing soon)
* 📱 Progressive Web App / Mobile App(mobile version coming soon)
* 🧭 AI-based itinerary suggestion engine

---

## 🧠 Contributing

We welcome contributions and ideas!
If you're a developer, designer, or travel enthusiast, feel free to fork the repo, create a new branch, and open a PR.

---

## 📩 Contact

For queries, collaborations, or feedback:
📧 [help.manzafir@gmail.com](mailto:help.manzafir@gmail.com)
📞 +91 703-936-6269

---



