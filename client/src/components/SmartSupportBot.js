import React, { useState } from "react";

const SmartSupportBot = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hey there! 👋 Need help with travel tips, packages or Manzafir?" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = (customInput) => {
    const messageToSend = customInput || input;
    if (!messageToSend.trim()) return;

    const userMsg = { sender: "user", text: messageToSend };
    const updatedMsgs = [...messages, userMsg];
    setMessages(updatedMsgs);
    setInput("");

    setTimeout(() => {
      const reply = getBotReply(messageToSend);
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    }, 500);
  };

  const getBotReply = (text) => {
    const msg = text.toLowerCase();

    if (msg.includes("budget") || msg.includes("save") || msg.includes("cheap") || msg.includes("tips")) {
      return "🤑 Budget hack: Travel during shoulder seasons, eat local, and always book early!";
    }
    if (msg.includes("custom") || msg.includes("personal") || msg.includes("plan") || msg.includes("create custom")) {
      return "🎒 Awesome! Head to our Contact Us page and send your request — we’ll tailor it just for you!";
    }
    if (msg.includes("group") || msg.includes("social") || msg.includes("hostel") || msg.includes("packages")) {
      return "👫 Yup! We help you find like-minded travelers and even offer hostel-based plans.";
    }
    if (msg.includes("mobile") || msg.includes("android") || msg.includes("ios") || msg.includes("app")) {
      return "📱 We’re working on our app — for now, enjoy all features via our website!";
    }
    if (msg.includes("contact") || msg.includes("help") || msg.includes("support")) {
      return "📨 Go to our Contact page and shoot us a message — we’ve got your back!";
    }

    return "😅 Please ask something related to travel, tips, packages, or Manzafir.";
  };

  const quickReplies = [
    "View Packages",
    "Create Custom Trip",
    "Contact Support",
    "Travel Tips",
  ];

  const handleQuickReply = (text) => {
    sendMessage(text);
  };

  return (
    <>
      <button
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full shadow-lg z-50"
        onClick={() => setChatOpen(!chatOpen)}
      >
        💬 Help & Support
      </button>

      {chatOpen && (
        <div className="fixed bottom-20 right-6 w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col z-50">
          <div className="bg-blue-600 text-white p-3 rounded-t-lg font-bold">Manzafir Smart Bot</div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-lg text-sm max-w-[75%] ${
                  msg.sender === "bot"
                    ? "bg-gray-200 text-black self-start"
                    : "bg-green-100 text-black self-end text-right ml-auto"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="p-2 flex flex-wrap gap-2 justify-start bg-gray-100">
            {quickReplies.map((text, i) => (
              <button
                key={i}
                onClick={() => handleQuickReply(text)}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 text-xs rounded"
              >
                {text}
              </button>
            ))}
          </div>

          <div className="p-2 border-t flex items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask a travel question..."
              className="flex-1 p-2 border rounded text-sm"
            />
            <button
              onClick={() => sendMessage()}
              className="ml-2 bg-green-600 text-white px-3 py-1 rounded text-sm"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SmartSupportBot;
