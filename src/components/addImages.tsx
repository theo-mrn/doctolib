"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ImageIcon, UploadIcon } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

type UploadSalonImagesProps = {
  salonId: number
  onUploadComplete?: () => void
}

const UploadSalonImages: React.FC<UploadSalonImagesProps> = ({ salonId, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { toast } = useToast()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    const fileInput = document.getElementById("file-upload") as HTMLInputElement
    const file = fileInput.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      setProgress(0)
      const filePath = `${salonId}/${Date.now()}_${file.name}`

      // Upload sans callback de progression
      const { error } = await supabase.storage
        .from("image_salons")
        .upload(filePath, file, {
          upsert: false
        })

      if (error) throw error

      const publicUrl = supabase.storage.from("image_salons").getPublicUrl(filePath).data.publicUrl

      if (!publicUrl) {
        throw new Error("Erreur lors de la récupération de l'URL publique de l'image")
      }

      const { error: insertError } = await supabase
        .from("salon_images")
        .insert({ salon_id: salonId, image_url: publicUrl })

      if (insertError) throw insertError

      toast({
        title: "Succès",
        description: "Image téléchargée avec succès !",
        duration: 5000,
      })

      if (onUploadComplete) {
        onUploadComplete()
      }

      // Reset the form
      setPreviewUrl(null)
      fileInput.value = ""
    } catch (error) {
      console.error("Erreur lors de l'upload de l'image :", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du téléchargement de l'image.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ImageIcon className="mr-2" />
          Ajouter des images au salon
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              {previewUrl ? (
                <Image
                  src={previewUrl || "/placeholder.svg"}
                  alt="Preview"
                  width={200}
                  height={200}
                  className="object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadIcon className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Cliquez pour sélectionner</span> ou glissez et déposez
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF jusqu&apos;à 10MB</p>
                </div>
              )}
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </div>
          {previewUrl && (
            <Button onClick={handleUpload} disabled={uploading} className="w-full">
              {uploading ? "Téléchargement en cours..." : "Télécharger l'image"}
            </Button>
          )}
          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-center text-gray-500">{Math.round(progress)}% téléchargé</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default UploadSalonImages

