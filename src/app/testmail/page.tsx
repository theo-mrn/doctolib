"use client";
import React, { useState } from "react";

const SendEmailPage = () => {
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");

  const handleSendEmail = async () => {
    setMessage("Envoi en cours...");

    try {
      const response = await fetch(
        "https://sijvzedmeayxyqybephs.supabase.co/functions/v1/send-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`, 
          },
          body: JSON.stringify({ email, date }), 
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur inconnue");
      }

      setMessage("✅ E-mail envoyé avec succès !");
    } catch (error) {
      console.error("Erreur lors de la requête :", error);
      setMessage(`❌ Erreur : ${(error as Error).message}`);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial", maxWidth: "600px", margin: "auto" }}>
      <h1>Test d'envoi d'e-mail via Supabase</h1>

      <label>Email du destinataire :</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="ex: user@example.com"
        required
        style={{ display: "block", marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
      />

      <label>Date du rendez-vous :</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
        style={{ display: "block", marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
      />

      <button
        onClick={handleSendEmail}
        style={{
          padding: "0.75rem",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Envoyer l'e-mail
      </button>

      {message && (
        <p style={{ marginTop: "1rem", color: message.includes("Erreur") ? "red" : "green" }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default SendEmailPage;