"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X, Eye } from "lucide-react"
import ImageCarousel from "./ImageCarousel"

// Définition des types
type Profile = {
  id: string
  email: string
}

type Salon = {
  id: number
  nom_salon: string
  adresse: string
  code_postal: string
  ville: string
  is_verified: boolean
  professionnel_id: string
  profiles: Profile | null
}

export default function ConciseSalonList() {
  const router = useRouter()
  const [salons, setSalons] = useState<Salon[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchSalons = async () => {
      try {
          // Récupération des salons
          const { data: salonsData, error: salonsError } = await supabase
              .from("salons")
              .select("id, nom_salon, adresse, code_postal, ville, is_verified, professionnel_id")
              .eq("is_verified", false)
  
          if (salonsError) throw salonsError
          console.log("✅ Salons récupérés :", salonsData)
  
          // Vérification que la donnée professionnel_id existe avant de faire la requête profile
          const salonsWithProfiles = await Promise.all(
              salonsData.map(async (salon) => {
                  if (!salon.professionnel_id) {
                      console.warn(`⚠ Pas de professionnel_id pour le salon ${salon.nom_salon}`)
                      return { ...salon, profiles: null }
                  }
  
                  const { data: profileData, error: profileError } = await supabase
                      .from("profiles")
                      .select("id, email")
                      .eq("id", salon.professionnel_id)
                      .maybeSingle() // Utilisation de maybeSingle() pour éviter l'erreur si aucun résultat
  
                  if (profileError) {
                      console.error(`❌ Erreur récupération profil pour ${salon.nom_salon} :`, profileError)
                      return { ...salon, profiles: null }
                  }
  
                  return { ...salon, profiles: profileData ?? null } // Si profileData est undefined, retourne null
              })
          )
  
          setSalons(salonsWithProfiles)
      } catch (e) {
          console.error("❌ Erreur lors de la récupération des salons :", e)
      }
  }

    fetchSalons()
  }, [])
  const sendSalonAcceptedEmail = async (ownerEmail: string, salonName: string) => {
    try {
      const response = await fetch("/api/send-confirmation-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerEmail, salonName }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error)

      console.log("✅ Email de confirmation envoyé :", result)
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi de l'email :", error)
    }
  }

  // Fonction pour accepter ou supprimer un salon
  const handleVerification = async (salonId: number, accept: boolean, ownerEmail?: string, salonName?: string) => {
    setLoading(true)

    try {
      if (accept) {
        const { error } = await supabase.from("salons").update({ is_verified: true }).eq("id", salonId)
        if (error) throw error

        // Envoyer un email au propriétaire du salon si accepté
        if (ownerEmail && salonName) {
          await sendSalonAcceptedEmail(ownerEmail, salonName)
        }
      } else {
        const { error } = await supabase.from("salons").delete().eq("id", salonId)
        if (error) throw error
      }

      // Mettre à jour l'état en supprimant le salon de la liste
      setSalons(salons.filter((salon) => salon.id !== salonId))
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour :", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Liste des Salons à Vérifier</h1>
      <div className="space-y-4">
        {salons.map((salon) => (
          <Card key={salon.id}>
            <CardHeader>
              <CardTitle>{salon.nom_salon}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <ImageCarousel salonId={salon.id} />
              </div>
              <p className="text-muted-foreground">
                {salon.adresse}, {salon.code_postal} {salon.ville}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                ID du professionnel: {salon.professionnel_id}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Email du professionnel: {salon.profiles?.email ?? "Non disponible"}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div>
                <Button
                  onClick={() => router.push(`/dashboard/${salon.id}`)}
                  variant="outline"
                  disabled={loading}
                >
                  <Eye className="mr-2 h-4 w-4" /> Voir
                </Button>
              </div>
              <div className="space-x-2">
                <Button
                  onClick={() => handleVerification(salon.id, true, salon.profiles?.email, salon.nom_salon)}
                  variant="default"
                  className="bg-primary hover:bg-primary/90"
                  disabled={loading}
                >
                  <Check className="mr-2 h-4 w-4" /> Accepter
                </Button>
                <Button
                  onClick={() => handleVerification(salon.id, false)}
                  variant="destructive"
                  disabled={loading}
                >
                  <X className="mr-2 h-4 w-4" /> Supprimer
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}