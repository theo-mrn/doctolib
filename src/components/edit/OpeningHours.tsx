"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { TimePicker } from "@/components/ui/time-picker"
import type { Salon, OpeningHoursRecord } from "@/types/salon"

// Supprimez l'interface OpeningHoursRecord existante car elle est maintenant importée
// ...existing code...

interface OpeningHoursProps {
  formData: Salon
  updateFormData: (field: keyof Salon, value: Record<string, OpeningHoursRecord>) => void
}

interface JourOuverture {
  jour: string
  ouvert: boolean
  matinDebut: string
  matinFin: string
  apremDebut: string
  apremFin: string
}

const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]

export default function OpeningHours({ formData, updateFormData }: OpeningHoursProps) {
  const [openingHours, setOpeningHours] = useState<JourOuverture[]>(() => {
    if (formData.ouverture && typeof formData.ouverture === 'object' && Object.keys(formData.ouverture).length > 0) {
      return jours.map((jour) => ({
        jour,
        ouvert: formData.ouverture?.[jour]?.isOpen ?? false,
        matinDebut: formData.ouverture?.[jour]?.morning?.start ?? "09:00",
        matinFin: formData.ouverture?.[jour]?.morning?.end ?? "12:00",
        apremDebut: formData.ouverture?.[jour]?.afternoon?.start ?? "14:00",
        apremFin: formData.ouverture?.[jour]?.afternoon?.end ?? "18:00",
      }))
    }
    return jours.map((jour) => ({
      jour,
      ouvert: false,
      matinDebut: "09:00",
      matinFin: "12:00",
      apremDebut: "14:00",
      apremFin: "18:00",
    }))
  })

  const updateParentFormData = useCallback(() => {
    const ouvertureRecord = openingHours.reduce(
      (acc, jour) => {
        acc[jour.jour] = {
          isOpen: jour.ouvert,
          morning: {
            start: jour.matinDebut,
            end: jour.matinFin,
          },
          afternoon: {
            start: jour.apremDebut,
            end: jour.apremFin,
          },
        }
        return acc
      },
      {} as Record<string, OpeningHoursRecord>,
    )

    updateFormData("ouverture", ouvertureRecord)
  }, [openingHours, updateFormData])

  useEffect(() => {
    updateParentFormData()
  }, [updateParentFormData])

  const handleChange = (index: number, field: keyof JourOuverture, value: string | boolean) => {
    setOpeningHours((prev) => prev.map((jour, i) => (i === index ? { ...jour, [field]: value } : jour)))
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Horaires d&apos;ouverture</h3>
      {openingHours.map((jour, index) => (
        <Card key={jour.jour} className="mb-2">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={jour.ouvert}
                onCheckedChange={(checked) => handleChange(index, "ouvert", checked as boolean)}
                id={`checkbox-${jour.jour}`}
              />
              <Label htmlFor={`checkbox-${jour.jour}`} className="font-normal">
                {jour.jour}
              </Label>
            </div>
            {jour.ouvert && (
              <>
                <div className="flex items-center space-x-2">
                  <Label>Matin:</Label>
                  <TimePicker value={jour.matinDebut} onChange={(value) => handleChange(index, "matinDebut", value)} />
                  <TimePicker value={jour.matinFin} onChange={(value) => handleChange(index, "matinFin", value)} />
                </div>
                <div className="flex items-center space-x-2">
                  <Label>Après-midi:</Label>
                  <TimePicker value={jour.apremDebut} onChange={(value) => handleChange(index, "apremDebut", value)} />
                  <TimePicker value={jour.apremFin} onChange={(value) => handleChange(index, "apremFin", value)} />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

