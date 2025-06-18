import React, { useState, useEffect, useRef } from "react";
import BotLogo from "../assets/logos/logosv.png";
import "../index.css";

const ChatbotPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState(null);
  const [messages, setMessages] = useState([
    { id: 0, sender: "bot", text: "Bonjour ! Je suis StartupBot, comment puis-je vous aider ?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Récupérer le token depuis localStorage au montage
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Scroll automatique vers le dernier message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  // Fermer popup avec ESC
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Envoi message à l'API backend
  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { id: Date.now(), sender: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/chatbot/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ question: input.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.answer) {
        const answer = data.answer;
        const parts = [];
        const chunkSize = 600;
        for (let i = 0; i < answer.length; i += chunkSize) {
          parts.push(answer.slice(i, i + chunkSize));
        }
        parts.forEach((part, index) => {
          setTimeout(() => {
            setMessages((prev) => [...prev, { id: Date.now() + index, sender: "bot", text: part }]);
            scrollToBottom();
          }, 600 * index);
        });
      } else {
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), sender: "bot", text: "Désolé, je n'ai pas pu comprendre votre demande." },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: "bot", text: "Erreur réseau, veuillez réessayer." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <button
        aria-label={isOpen ? "Fermer chatbot" : "Ouvrir chatbot"}
        className={`chatbot-toggle ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        💬
      </button>

      <div
        className={`chatbot-popup ${isOpen ? "show" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chatbot-title"
      >
        <div className="chatbot-header">
          <span id="chatbot-title" className="chatbot-header-title">
            <img src={BotLogo} alt="Logo bot" className="bot-logo" />
            StartupBot
          </span>
          <button aria-label="Fermer chatbot" className="close-btn" onClick={() => setIsOpen(false)}>
            ✖
          </button>
        </div>

        <div className="chatbot-body" tabIndex={0}>
          {messages.map(({ id, sender, text }) => (
            <div key={id} className={`message ${sender}`}>
              <p>{text}</p>
            </div>
          ))}
          {loading && (
            <div
              className="message bot typing-indicator"
              aria-live="polite"
              aria-busy="true"
            >
              <span />
              <span />
              <span />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form
          className="chatbot-input-area"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <textarea
            className="chatbot-input"
            placeholder="Pose ta question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={loading}
            aria-label="Message"
          />
          <button
            type="submit"
            className="send-btn"
            disabled={loading || input.trim() === ""}
            aria-label="Envoyer message"
          >
            ➤
          </button>
        </form>
      </div>

      {isOpen && <div className="chatbot-backdrop" onClick={() => setIsOpen(false)} />}
    </>
  );
};

export default ChatbotPopup;
