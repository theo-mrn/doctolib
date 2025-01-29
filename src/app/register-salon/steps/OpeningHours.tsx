import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { TimePicker } from "@/components/ui/time-picker"
import { SalonFormData, OpeningHour } from "../SalonRegistrationForm"

interface OpeningHoursProps {
  step: 'opening-hours';
  formData: SalonFormData;
  setFormData: React.Dispatch<React.SetStateAction<SalonFormData>>;
}

interface JourOuverture {
  jour: string;
  ouvert: boolean;
  matinDebut: string;
  matinFin: string;
  apremDebut: string;
  apremFin: string;
}

const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]

export default function OpeningHours({ formData, setFormData }: Omit<OpeningHoursProps, 'step'>) {
  const [openingHours, setOpeningHours] = useState<JourOuverture[]>(() => {
    if (formData.ouverture && Object.keys(formData.ouverture).length > 0) {
      return jours.map(jour => ({
        jour,
        ouvert: formData.ouverture[jour]?.isOpen || false,
        matinDebut: formData.ouverture[jour]?.morning?.start || "09:00",
        matinFin: formData.ouverture[jour]?.morning?.end || "12:00",
        apremDebut: formData.ouverture[jour]?.afternoon?.start || "14:00",
        apremFin: formData.ouverture[jour]?.afternoon?.end || "18:00",
      }))
    }
    return jours.map(jour => ({
      jour,
      ouvert: false,
      matinDebut: "09:00",
      matinFin: "12:00",
      apremDebut: "14:00",
      apremFin: "18:00",
    }))
  })

  const handleChange = (index: number, field: keyof JourOuverture, value: string | boolean) => {
    const updatedHours = openingHours.map((jour, i) => (i === index ? { ...jour, [field]: value } : jour))
    setOpeningHours(updatedHours)
    
    const ouvertureRecord = updatedHours.reduce((acc, jour) => {
      acc[jour.jour] = {
        isOpen: jour.ouvert,
        morning: {
          start: jour.matinDebut,
          end: jour.matinFin
        },
        afternoon: {
          start: jour.apremDebut,
          end: jour.apremFin
        }
      }
      return acc
    }, {} as Record<string, OpeningHour>)
    
    setFormData(prev => ({ ...prev, ouverture: ouvertureRecord }))
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Horaires d&apos;ouverture</h3>
      {openingHours.map((jour, index) => (
        <Card key={jour.jour} className="mb-2">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={jour.ouvert}
                  onCheckedChange={(checked) => handleChange(index, "ouvert", checked)}
                  id={`checkbox-${jour.jour}`}
                />
                <Label htmlFor={`checkbox-${jour.jour}`} className="font-medium w-24">
                  {jour.jour}
                </Label>
              </div>
              
              {jour.ouvert && (
                <div className="flex flex-col space-y-2 pl-6">
                  <div className="flex items-center space-x-2">
                    <Label className="w-24">Matin:</Label>
                    <TimePicker value={jour.matinDebut} onChange={(value) => handleChange(index, "matinDebut", value)} />
                    <span className="mx-2">-</span>
                    <TimePicker value={jour.matinFin} onChange={(value) => handleChange(index, "matinFin", value)} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label className="w-24">Après-midi:</Label>
                    <TimePicker value={jour.apremDebut} onChange={(value) => handleChange(index, "apremDebut", value)} />
                    <span className="mx-2">-</span>
                    <TimePicker value={jour.apremFin} onChange={(value) => handleChange(index, "apremFin", value)} />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

