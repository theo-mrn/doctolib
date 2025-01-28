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
  debut: string;
  fin: string;
}

const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]

export default function OpeningHours({ formData, setFormData }: Omit<OpeningHoursProps, 'step'>) {
  const [openingHours, setOpeningHours] = useState<JourOuverture[]>(() => {
    if (formData.ouverture && Object.keys(formData.ouverture).length > 0) {
      return jours.map(jour => ({
        jour,
        ouvert: formData.ouverture[jour]?.isOpen || false,
        debut: formData.ouverture[jour]?.morning?.start || "09:00",
        fin: formData.ouverture[jour]?.morning?.end || "18:00"
      }))
    }
    return jours.map(jour => ({ 
      jour, 
      ouvert: false, 
      debut: "09:00", 
      fin: "18:00" 
    }))
  })

  const handleChange = (index: number, field: keyof JourOuverture, value: string | boolean) => {
    const updatedHours = openingHours.map((jour, i) => (i === index ? { ...jour, [field]: value } : jour))
    setOpeningHours(updatedHours)
    
    // Convertir le format pour formData.ouverture
    const ouvertureRecord = updatedHours.reduce((acc, jour) => {
      acc[jour.jour] = {
        isOpen: jour.ouvert,
        morning: {
          start: jour.debut,
          end: jour.fin
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
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={jour.ouvert}
                onCheckedChange={(checked) => handleChange(index, "ouvert", checked)}
                id={`checkbox-${jour.jour}`}
              />
              <Label htmlFor={`checkbox-${jour.jour}`} className="font-normal">
                {jour.jour}
              </Label>
            </div>
            {jour.ouvert && (
              <>
                <TimePicker value={jour.debut} onChange={(value) => handleChange(index, "debut", value)} />
                <TimePicker value={jour.fin} onChange={(value) => handleChange(index, "fin", value)} />
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

