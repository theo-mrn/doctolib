import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    console.log("👉 Requête reçue avec la méthode POST");
    
    try {
        const { email, date } = await req.json();
        console.log("📧 Email :", email);
        console.log("📅 Date :", date);

        if (!email || !date) {
            return NextResponse.json({ error: "Email et date sont requis." }, { status: 400 });
        }

        const response = await fetch("https://api.resend.com/emails", {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: "onboarding@resend.dev",
                to: [email],
                subject: "Rappel de rendez-vous",
                html: `<p>Votre rendez-vous est prévu le <strong>${date}</strong>. Merci de ne pas oublier !</p>`,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("❌ Erreur API Resend :", errorData);
            throw new Error(errorData.message || "Erreur inconnue avec Resend");
        }

        console.log("✅ E-mail envoyé avec succès !");
        return NextResponse.json({ message: "✅ E-mail envoyé avec succès !" }, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("❌ Erreur capturée :", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        console.error("❌ Erreur inconnue :", error);
        return NextResponse.json({ error: "Une erreur inconnue est survenue" }, { status: 500 });
    }
}