"use client"

import { useState, useTransition, useCallback } from "react"
import { useRouter } from 'next/navigation'
import { type Salon, type UpdateFormDataFunction } from "@/types/salon"
import { updateSalon } from '@/lib/supabase/salon'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import OpeningHours from "./OpeningHours"
import Pricing from "./Pricing"
import ServiceTypes from "./ServiceTypes"

type SalonFormProps = {
  initialSalon: Salon
}

export function SalonForm({ initialSalon }: SalonFormProps) {
  const [formData, setFormData] = useState<Salon>(initialSalon)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Ajouter ceci pour s'assurer qu'aucun autre handler ne sera appelé
    startTransition(async () => {
      const result = await updateSalon(formData.id, formData)
      if (result.success) {
        router.push('./')
      } else {
        alert(`Erreur lors de la mise à jour du salon: ${result.message}`)
      }
    })
  }

  const updateFormData: UpdateFormDataFunction = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <div>
          <Label htmlFor="nom_salon">Nom du salon</Label>
          <Input id="nom_salon" name="nom_salon" value={formData.nom_salon} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="adresse">Adresse</Label>
          <Input id="adresse" name="adresse" value={formData.adresse} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="code_postal">Code postal</Label>
          <Input id="code_postal" name="code_postal" value={formData.code_postal} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="ville">Ville</Label>
          <Input id="ville" name="ville" value={formData.ville} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" value={formData.description || ""} onChange={handleChange} />
        </div>
      </div>

      <OpeningHours formData={formData} updateFormData={updateFormData} />
      <Pricing formData={formData} updateFormData={updateFormData} />
      <ServiceTypes formData={formData} updateFormData={updateFormData} />

      <Button type="submit" disabled={isPending}>
        {isPending ? "Mise à jour..." : "Mettre à jour le salon"}
      </Button>
    </form>
  )
}

