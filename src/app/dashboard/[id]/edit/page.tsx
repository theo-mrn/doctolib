"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { SalonForm } from "@/components/edit/SalonForm"
import type { Salon } from "@/types/salon"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ImageIcon, ScissorsIcon } from "lucide-react"

async function fetchSalon(id: string): Promise<Salon | null> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    console.error("Erreur lors de la récupération de la session:", sessionError)
    return null
  }

  if (session && session.user) {
    console.log("Utilisateur actuel:", session.user.id)
  } else {
    console.log("Aucune session trouvée")
    return null
  }

  const { data: salon, error } = await supabase
    .from("salons")
    .select("*, professionnel_id")
    .eq("id", Number.parseInt(id))
    .single()

  if (error) {
    console.error("Error fetching salon:", error)
    return null
  }

  console.log("professional_id:", salon.professionnel_id)
  return salon as Salon
}

export default function EditSalonPage() {
  const params = useParams()
  const router = useRouter()
  const [salon, setSalon] = useState<Salon | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function getSalon() {
      if (!params.id || typeof params.id !== 'string') {
        console.error("ID de salon invalide")
        return
      }
      const fetchedSalon = await fetchSalon(params.id)
      setSalon(fetchedSalon)
    }

    async function getUserId() {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session && session.user) {
        console.log("Utilisateur actuel:", session.user.id)
        setUserId(session.user.id)
      }
    }

    getUserId()
    getSalon()
  }, [params.id])

  if (!salon) {
    return <div className="flex items-center justify-center h-screen">Salon non trouvé</div>
  }

  if (salon.professionnel_id !== userId) {
    return <div className="flex items-center justify-center h-screen">Vous n&apos;êtes pas autorisé à modifier ce salon</div>
  }

  const handleRedirect = (path: string) => {
    router.push(`/dashboard/${params.id}/${path}`)
  }

  console.log("Accès autorisé, affichage de la page de modification")
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Modifier le salon</h1>
      <div className="mt-12 grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Images du salon</CardTitle>
            <CardDescription>Ajoutez des photos de votre salon</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleRedirect("upload")} className="w-full">
              <ImageIcon className="mr-2 h-4 w-4" /> Ajouter des images de salon
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Images de prestation</CardTitle>
            <CardDescription>Ajoutez des photos de vos prestations</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleRedirect("prestation")} className="w-full">
              <ScissorsIcon className="mr-2 h-4 w-4" /> Ajouter des images de prestation
            </Button>
          </CardContent>
        </Card>
      </div>
      <br></br>
      <SalonForm initialSalon={salon} />


    </div>
  )
}

