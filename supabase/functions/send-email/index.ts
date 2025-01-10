import { serve } from "https://deno.land/x/sift@0.6.0/mod.ts";

// Clé API sécurisée depuis Supabase (via Variable d'environnement)
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const RESEND_API_URL = "https://api.resend.com/emails";

// Fonction pour formater la date en français
function formatDateToFrench(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

serve({
  "/send-email": async (req: Request) => {
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

    if (req.method !== "POST") {
      return new Response("Méthode non autorisée", {
        status: 405,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    try {
      const { email, date } = await req.json();
      const formattedDate = formatDateToFrench(date);

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
        throw new Error(errorData.message || "Erreur inconnue");
      }

      return new Response("✅ E-mail envoyé avec succès !", {
        status: 200,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      });
    }
  },
});