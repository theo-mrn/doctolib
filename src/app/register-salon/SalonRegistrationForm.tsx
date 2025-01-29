"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import BasicInfo from "./steps/Basiclnfo"
import Address from "./steps/Address"
import DescriptionImage from "./steps/DescriptionImage"
import OpeningHours from "./steps/OpeningHours"
import Pricing from "./steps/Pricing"
import ServiceTypes from "./steps/ServiceTypes"
// Supprimer l'import de SocialLinks
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export interface OpeningHour {
  isOpen: boolean
  morning?: {
    start: string
    end: string
  }
  afternoon?: {
    start: string
    end: string
  }
}

export interface Service {
  id: string
  title: string
  description?: string
  duration: string
  price: string
}

export interface Category {
  id: string
  title: string
  services: Service[]
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface SalonFormData {
  nom_salon: string
  adresse: string
  code_postal: string
  ville: string
  description: string
  ouverture: Record<string, OpeningHour>
  pricing: Category[]
  types: string[]
  social_links: Record<string, SocialLink>
}

interface ServiceDetails {
  description?: string  // Rendre la description optionnelle
  duration: string
  price: number
}

interface PricingObject {
  [category: string]: {
    [service: string]: ServiceDetails
  }
}

// Interfaces spécifiques pour chaque étape avec une propriété discriminante
interface BasicInfoProps {
  step: 'basic-info'
  formData: SalonFormData
  setFormData: React.Dispatch<React.SetStateAction<SalonFormData>>
}

interface AddressProps {
  step: 'address'
  formData: SalonFormData
  setFormData: React.Dispatch<React.SetStateAction<SalonFormData>>
}

interface DescriptionImageProps {
  step: 'description-image'
  formData: SalonFormData
  setFormData: React.Dispatch<React.SetStateAction<SalonFormData>>
}

interface OpeningHoursProps {
  step: 'opening-hours'
  formData: SalonFormData
  setFormData: React.Dispatch<React.SetStateAction<SalonFormData>>
}

interface PricingProps {
  step: 'pricing'
  formData: SalonFormData
  setFormData: React.Dispatch<React.SetStateAction<SalonFormData>>
}

interface ServiceTypesProps {
  step: 'service-types'
  formData: SalonFormData
  setFormData: React.Dispatch<React.SetStateAction<SalonFormData>>
}

type StepProps = 
  | BasicInfoProps 
  | AddressProps 
  | DescriptionImageProps 
  | OpeningHoursProps 
  | PricingProps 
  | ServiceTypesProps

type StepComponent = React.ComponentType<StepProps>

const steps: Array<{ title: string; component: StepComponent; step: StepProps['step'] }> = [
  { title: "Informations de base", component: BasicInfo, step: 'basic-info' },
  { title: "Adresse", component: Address, step: 'address' },
  { title: "Description et image", component: DescriptionImage, step: 'description-image' },
  { title: "Horaires d'ouverture", component: OpeningHours, step: 'opening-hours' },
  { title: "Tarification", component: Pricing, step: 'pricing' },
  { title: "Types de services et réseaux sociaux", component: ServiceTypes, step: 'service-types' },
]

export default function SalonRegistrationForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<SalonFormData>({
    nom_salon: "",
    adresse: "",
    code_postal: "",
    ville: "",
    description: "",
    ouverture: {},
    pricing: [],
    types: [],
    social_links: {}
  })
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUserId(session.user.id)
        console.log("Connected user ID:", session.user.id)
      }
    }
    getSession()
  }, [])

  const isStepValid = () => {
    switch (currentStep) {
      case 0: // BasicInfo
        return formData.nom_salon.trim() !== ""
      case 1: // Address
        return formData.adresse.trim() !== "" && formData.code_postal.trim() !== "" && formData.ville.trim() !== ""
      case 2: // DescriptionImage
        return formData.description.trim() !== ""
      case 3: // OpeningHours
        return formData.ouverture && Object.keys(formData.ouverture).length > 0
      case 4: // Pricing
        const pricingData = formData.pricing || [];
        return pricingData.length > 0 && pricingData.every(category => 
          category.title.trim() !== "" && 
          category.services.length > 0 && 
          category.services.every(service => 
            service.title.trim() !== "" && 
            service.duration.trim() !== "" && 
            service.price.trim() !== ""
          )
        );
      case 5: // ServiceTypes et SocialLinks
        return formData.types && formData.types.length > 0
      default:
        return true
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1 && isStepValid()) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (currentStep === steps.length - 1 && isStepValid()) {
      const pricingObject = formData.pricing.reduce<PricingObject>((acc, category) => {
        acc[category.title] = category.services.reduce<{ [key: string]: ServiceDetails }>((serviceAcc, service) => {
          serviceAcc[service.title] = {
            description: service.description || "",
            duration: service.duration,
            price: parseFloat(service.price),
          }
          return serviceAcc
        }, {})
        return acc
      }, {})

      const dataToSubmit = {
        professionnel_id: userId,
        nom_salon: formData.nom_salon,
        adresse: formData.adresse,
        code_postal: formData.code_postal,
        ville: formData.ville,
        description: formData.description,
        ouverture: formData.ouverture,
        pricing: pricingObject,
        types: formData.types,
        social_links: formData.social_links,
      }

      const { data, error } = await supabase
        .from('salons')
        .insert([dataToSubmit])
        .select('id')
        .single()

      if (error) {
        console.error("Error submitting form:", error)
      } else {
        console.log("Form submitted successfully")
        router.push(`/dashboard/${data.id}`)
      }
    }
  }

  const CurrentStepComponent = steps[currentStep].component as React.ComponentType<StepProps & { step: StepProps['step'] }>

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CurrentStepComponent 
            step={steps[currentStep].step}
            formData={formData} 
            setFormData={setFormData} 
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handlePrevious} 
            disabled={currentStep === 0}
          >
            Précédent
          </Button>
          {currentStep === steps.length - 1 ? (
            <Button 
              type="submit" 
              disabled={!isStepValid()}
            >
              Enregistrer le salon
            </Button>
          ) : (
            <Button 
              type="button" 
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              Suivant
            </Button>
          )}
        </CardFooter>
      </Card>
    </form>
  )
}

