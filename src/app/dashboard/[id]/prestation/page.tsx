"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import UploadPrestationImages from "@/components/addprestationimages"
import GalleryPrestationImages from "@/components/prestationimages"

const PrestationPage = () => {
  const params = useParams()
  const router = useRouter()
  const [salonId, setSalonId] = useState<number | null>(null)
  const [professionnelId, setProfessionnelId] = useState<number | null>(null)
  const [refreshGallery, setRefreshGallery] = useState(false)

  const handleUploadComplete = () => {
    setRefreshGallery(!refreshGallery)
  }

  useEffect(() => {
    const fetchProfessionnelId = async () => {
      const id = params.id ? Number.parseInt(params.id as string, 10) : null
      if (id !== null && !isNaN(id)) {
        const { data: salon, error } = await supabase.from("salons").select("professionnel_id").eq("id", id).single()

        if (error) {
          console.error("Erreur lors de la récupération du professionnel_id:", error)
        } else {
          setSalonId(id)
          setProfessionnelId(salon.professionnel_id)
          console.log("Salon ID:", id)
          console.log("Professionnel ID:", salon.professionnel_id)
        }
      }
    }

    fetchProfessionnelId()
  }, [params.id])

  if (salonId === null || professionnelId === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        Erreur : ID du salon ou ID du professionnel non valide
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button onClick={() => router.push("./edit")} variant="outline" className="mb-6">
        <ArrowLeftIcon className="mr-2 h-4 w-4" /> Retour
      </Button>

      <div className="mb-8">
        <UploadPrestationImages salonId={salonId} onUploadComplete={handleUploadComplete} />
      </div>

      <div>
        <GalleryPrestationImages salonId={salonId} refresh={refreshGallery} />
      </div>
    </div>
  )
}

export default PrestationPage

