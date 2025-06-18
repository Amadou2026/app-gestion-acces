import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const Chatbot = () => {
  const [token, setToken] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFullAnswer, setShowFullAnswer] = useState(false);

  const answerRef = useRef(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) setToken(storedToken);
  }, []);

  const askQuestion = async () => {
    if (!token) {
      setError("Vous devez être connecté.");
      return;
    }
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setShowFullAnswer(false);
    setAnswer("");

    try {
      const response = await axios.post(
        "http://localhost:8000/api/chatbot/",
        { question },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setAnswer(response.data.answer);
      // Scroll answer into view
      setTimeout(() => {
        answerRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      console.error("Erreur :", err.response?.data || err.message);
      setError("Une erreur est survenue, veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // Envoi avec Ctrl+Entrée
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.ctrlKey && !loading && question.trim()) {
      askQuestion();
    }
  };

  // Limite longueur réponse visible
  const MAX_VISIBLE_LENGTH = 350;

  const isLongAnswer = answer.length > MAX_VISIBLE_LENGTH;
  const displayedAnswer = showFullAnswer ? answer : answer.slice(0, MAX_VISIBLE_LENGTH) + (isLongAnswer ? "..." : "");

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Pose ta question</h2>

      <textarea
        rows={4}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Écris ta question ici... (Ctrl+Entrée pour envoyer)"
        style={styles.textarea}
        disabled={loading}
      />

      <button
        onClick={askQuestion}
        disabled={loading || !question.trim()}
        style={{
          ...styles.button,
          ...(loading || !question.trim() ? styles.buttonDisabled : {}),
        }}
      >
        {loading ? (
          <span className="spinner" style={styles.spinner} aria-label="Chargement..." />
        ) : (
          "Envoyer"
        )}
      </button>

      <div style={styles.answerBox}>
        <h3>Réponse :</h3>
        {error && <p style={styles.error}>{error}</p>}

        {!error && answer && (
          <>
            <p ref={answerRef} style={styles.answerText}>
              {displayedAnswer}
            </p>
            {isLongAnswer && (
              <button
                onClick={() => setShowFullAnswer(!showFullAnswer)}
                style={styles.toggleAnswerBtn}
                aria-expanded={showFullAnswer}
              >
                {showFullAnswer ? "Réduire la réponse" : "Afficher la réponse complète"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Styles inline (tu peux aussi utiliser CSS/Styled Components)
const styles = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    maxWidth: 480,
    margin: "0 auto",
    padding: 15,
  },
  title: {
    color: "#2563eb",
    marginBottom: 10,
  },
  textarea: {
    width: "100%",
    padding: 12,
    fontSize: 16,
    borderRadius: 8,
    border: "1.5px solid #ccc",
    resize: "vertical",
    transition: "border-color 0.2s",
  },
  button: {
    marginTop: 12,
    padding: "10px 25px",
    fontSize: 16,
    backgroundColor: "#2563eb",
    border: "none",
    borderRadius: 8,
    color: "white",
    cursor: "pointer",
    userSelect: "none",
    transition: "background-color 0.3s",
  },
  buttonDisabled: {
    backgroundColor: "#94a3b8",
    cursor: "not-allowed",
  },
  spinner: {
    border: "3px solid #f3f3f3",
    borderTop: "3px solid #2563eb",
    borderRadius: "50%",
    width: 18,
    height: 18,
    display: "inline-block",
    animation: "spin 1s linear infinite",
  },
  answerBox: {
    marginTop: 25,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 15,
    minHeight: 80,
    boxShadow: "0 2px 10px rgb(37 99 235 / 0.1)",
  },
  answerText: {
    whiteSpace: "pre-wrap",
    fontSize: 15,
    lineHeight: 1.5,
    color: "#1e293b",
  },
  error: {
    color: "#dc2626",
    fontWeight: "600",
  },
  toggleAnswerBtn: {
    marginTop: 8,
    backgroundColor: "transparent",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: "600",
  },
};

// Animation CSS (ajoute dans un fichier CSS global ou <style>)
// @keyframes spin {
//   0% { transform: rotate(0deg); }
//   100% { transform: rotate(360deg); }
// }

export default Chatbot;
