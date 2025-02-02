import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    console.log("👉 Requête reçue pour confirmation de salon");

    try {
        const { ownerEmail, salonName } = await req.json();
        console.log("📧 Email du propriétaire :", ownerEmail);
        console.log("🏠 Nom du salon :", salonName);

        if (!ownerEmail || !salonName) {
            return NextResponse.json({ error: "L'email et le nom du salon sont requis." }, { status: 400 });
        }

        const response = await fetch("https://api.resend.com/emails", {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: "onboarding@resend.dev",
                to: [ownerEmail],
                subject: "Votre salon a été accepté ! 🎉",
                html: `<p>Félicitations ! Votre salon <strong>${salonName}</strong> a été accepté sur notre plateforme. Vous pouvez maintenant gérer vos réservations.</p>`,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("❌ Erreur API Resend :", errorData);
            throw new Error(errorData.message || "Erreur inconnue avec Resend");
        }

        console.log("✅ E-mail de confirmation envoyé !");
        return NextResponse.json({ message: "✅ E-mail de confirmation envoyé !" }, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("❌ Erreur capturée :", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        console.error("❌ Erreur inconnue :", error);
        return NextResponse.json({ error: "Une erreur inconnue est survenue" }, { status: 500 });
    }
}