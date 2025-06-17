import React, { useState, useEffect } from 'react';
import "../index.css";

const AssistantOverlay = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Bonjour ! Comment puis-je vous aider ?' },
  ]);
  const [input, setInput] = useState('');
  const [profil, setProfil] = useState('commercial'); // Valeur par défaut

  // Lire le profil depuis les paramètres de l’URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const profilParam = params.get('profil');
    if (profilParam === 'marketing' || profilParam === 'commercial') {
      setProfil(profilParam);
    }
  }, []);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      // Récupération du token JWT stocké dans localStorage (clé correcte : "accessToken")
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setMessages(prev => [
          ...prev,
          { sender: 'bot', text: "🚨 Vous devez être connecté pour envoyer un message." },
        ]);
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,  // Toujours envoyer Bearer + token
        },
        body: JSON.stringify({ message: input, profil }),
      });

      if (response.status === 401) {
        setMessages(prev => [
          ...prev,
          { sender: 'bot', text: "🚨 Votre session a expiré. Veuillez vous reconnecter." },
        ]);
        return;
      }

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      const cleanedReply = (data.reply || "❌ Aucune réponse.")
        .replace(/`/g, '')
        .replace(/\s+$/g, '');

      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: cleanedReply,
        },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: "🚨 Erreur de connexion au serveur." },
      ]);
    }
  };

  return (
    <div className="assistant-overlay">
      <div className="assistant-window">
        <div className="assistant-header">
          <span>🚀 StartupBot</span>
          <button onClick={onClose} className="close-button">✖</button>
        </div>

        <div className="assistant-body">
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-message ${msg.sender === 'user' ? 'user' : 'bot'}`}
              >
                {msg.text.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            ))}
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écris un message..."
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend}>Envoyer</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantOverlay;
