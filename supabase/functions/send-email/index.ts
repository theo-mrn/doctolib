import { serve } from "https://deno.land/x/sift@0.6.0/mod.ts";

// Clé API Resend
const RESEND_API_KEY = "re_SxYhT2Kv_H3S9b6ox4q2MPdKX8KXW7U1g"; // Remplace par ta clé API Resend
const RESEND_API_URL = "https://api.resend.com/emails"; // URL de l'API de Resend

serve({
  "/send-email": async (req: Request) => {
    // Gérer la requête OPTIONS pour CORS (prévol)
    if (req.method === "OPTIONS") {
      return new Response("Preflight OK", {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*", // Autoriser toutes les origines
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      });
    }

    // Accepter seulement les requêtes POST
    if (req.method !== "POST") {
      return new Response("Méthode non autorisée", {
        status: 405,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    try {
      const { email, date } = await req.json();
      const response = await fetch(RESEND_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "onboarding@resend.dev", 
          to: [email],
          subject: "Rappel de rendez-vous",
          html: `<p>Votre rendez-vous est prévu le ${date}. Merci de ne pas oublier !</p>`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur inconnue");
      }


      return new Response("E-mail envoyé avec succès !", {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      // Gérer les erreurs et retourner un message approprié
      return new Response(`Erreur : ${error.message}`, {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      });
    }
  },
});