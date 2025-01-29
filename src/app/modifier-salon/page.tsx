"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { Salon } from "@/types/salon"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Scissors, MapPin, Edit } from "lucide-react"
import ImageCarousel from "@/components/ImageCarousel"

export default function ModifierSalonPage() {
  const [salons, setSalons] = useState<Salon[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchSalons() {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session && session.user) {
        setUserId(session.user.id)
        const { data: salons, error } = await supabase
          .from("salons")
          .select("*")
          .eq("professionnel_id", session.user.id)

        if (error) {
          console.error("Erreur lors de la récupération des salons:", error)
        } else {
          setSalons(salons)
        }
      }
    }

    fetchSalons()
  }, [])

  if (!userId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  const handleEdit = (salonId: number) => {
    router.push(`/dashboard/${salonId}/edit`)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Mes Salons</h1>
      {salons.length === 0 ? (
        <div className="text-center text-gray-600">Aucun salon trouvé</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {salons.map((salon) => (
            <Card key={salon.id} className="overflow-hidden">
              <CardHeader className="bg-primary/10">
                <CardTitle className="flex items-center">
                  <Scissors className="mr-2" />{salon.nom_salon}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ImageCarousel salonId={salon.id} />
                <p className="flex items-center text-gray-600 mt-4">
                  <MapPin className="mr-2" size={18} />
                  {salon.adresse}
                </p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleEdit(salon.id)} className="w-full" variant="outline">
                  <Edit className="mr-2" size={18} />
                  Modifier le salon
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

