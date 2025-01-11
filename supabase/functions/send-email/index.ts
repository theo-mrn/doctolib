import { serve } from "https://deno.land/std@0.207.0/http/server.ts";
// Import explicite des types pour éviter les erreurs avec Deno 2.x
import type { ServeInit } from "https://deno.land/std@0.207.0/http/server.ts";

// Chargement de la clé API depuis les variables d'environnement
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const RESEND_API_URL = "https://api.resend.com/emails";

// Fonction utilitaire pour formater une date en français
function formatDateToFrench(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Démarrer le serveur HTTP avec gestion des erreurs et CORS
serve(async (req: Request) => {
  // Gestion des pré-vols CORS
  if (req.method === "OPTIONS") {
    return new Response("Preflight OK", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  // Seules les requêtes POST sont acceptées
  if (req.method !== "POST") {
    return new Response("Méthode non autorisée", {
      status: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }

  try {
    // Récupération et validation des données reçues
    const { email, date } = await req.json();
    if (!email || !date) {
      return new Response("Email et date sont requis", {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    const formattedDate = formatDateToFrench(date);

    // Envoi de l'e-mail via l'API Resend
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
        html: `<p>Votre rendez-vous est prévu le <strong>${formattedDate}</strong>. Merci de ne pas oublier !</p>`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erreur inconnue lors de l'envoi de l'e-mail.");
    }

    return new Response("✅ E-mail envoyé avec succès !", {
      status: 200,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
    });
  }
});