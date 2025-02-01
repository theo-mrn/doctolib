"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X, Eye } from "lucide-react"
import ImageCarousel from "./ImageCarousel"

type Salon = {
  id: number
  nom_salon: string
  adresse: string
  code_postal: string
  ville: string
  is_verified: boolean
  professionnel_id: string
  profiles: {
    id: string
    email: string
  } | null
}

export default function ConciseSalonList() {
  const router = useRouter()
  const [salons, setSalons] = useState<Salon[]>([])

  useEffect(() => {
    const fetchSalons = async () => {
      try {
        // D'abord, récupérer les salons non vérifiés
        const { data: salonsData, error: salonsError } = await supabase
          .from("salons")
          .select('*')
          .eq('is_verified', false)

        if (salonsError) {
          console.error("Error fetching salons:", salonsError)
          return
        }

        console.log("Salons data:", salonsData)

        // Pour chaque salon, récupérer le profil correspondant
        const salonsWithProfiles = await Promise.all(salonsData.map(async (salon) => {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select('email')
            .eq('id', salon.professionnel_id)
            .single()

          if (profileError) {
            console.error("Error fetching profile:", profileError)
            return salon
          }

          console.log("Profile data for salon", salon.id, ":", profileData)
          return {
            ...salon,
            profiles: profileData
          }
        }))

        setSalons(salonsWithProfiles)
      } catch (e) {
        console.error("Caught error:", e)
      }
    }

    fetchSalons()
  }, [])

  const handleVerification = async (salonId: number, accept: boolean) => {
    if (accept) {
      const { error } = await supabase.from("salons").update({ is_verified: true }).eq("id", salonId)

      if (error) {
        console.error("Error accepting salon:", error)
        return
      }
    } else {
      const { error } = await supabase.from("salons").delete().eq("id", salonId)

      if (error) {
        console.error("Error deleting salon:", error)
        return
      }
    }
    setSalons(salons.filter((salon) => salon.id !== salonId))
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
                Email du professionnel: {salon.profiles?.email}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div>
                <Button
                  onClick={() => router.push(`/dashboard/${salon.id}`)}
                  variant="outline"
                >
                  <Eye className="mr-2 h-4 w-4" /> Voir
                </Button>
              </div>
              <div className="space-x-2">
                <Button
                  onClick={() => handleVerification(salon.id, true)}
                  variant="default"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Check className="mr-2 h-4 w-4" /> Accepter
                </Button>
                <Button 
                  onClick={() => handleVerification(salon.id, false)} 
                  variant="destructive"
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

