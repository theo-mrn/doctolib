// pages/api/send-email.ts
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * API Route sécurisée côté serveur Next.js
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    const { email, date } = req.body;

    try {
        const response = await fetch("https://sijvzedmeayxyqybephs.supabase.co/functions/v1/send-email", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.RESEND_API_KEY}`, 
            },
            body: JSON.stringify({ email, date }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Erreur inconnue");
        }

        res.status(200).json({ message: '✅ E-mail envoyé avec succès !' });
    } catch (error: any) {
        console.error("❌ Erreur :", error.message);
        res.status(500).json({ error: error.message });
    }
}