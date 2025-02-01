"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import type { Salon, SocialLink } from "@/types/salon"

const PREDEFINED_SERVICES = [
  "Coiffeur", "Barbier", "Manucure", 
  "Pédicure", "Coloration",
  "Extensions", "Massage crânien", 
  "Epilation", "Maquillage", "Soins du visage", "Soins du corps", "Spa", 
  "Tatouage", "Piercing", "Soins des pieds", "Soins des mains", "Onglerie", 
  "Beauté des pieds", "Relooking"
]

type ServiceTypesValue = string[] | SocialLink[]

interface ServiceTypesProps {
  formData: Salon
  updateFormData: (field: keyof Salon, value: ServiceTypesValue) => void
}

export default function ServiceTypes({ formData, updateFormData }: ServiceTypesProps) {
  const [types, setTypes] = useState(formData.types || [])
  const [newType, setNewType] = useState("")
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(
    Array.isArray(formData.social_links) ? formData.social_links : []
  )

  const updateParentFormData = useCallback(() => {
    updateFormData("types", types)
    updateFormData("social_links", socialLinks)
  }, [types, socialLinks, updateFormData])

  useEffect(() => {
    updateParentFormData()
  }, [updateParentFormData])

  const handleAddType = () => {
    if (newType && !types.includes(newType)) {
      setTypes((prev) => [...prev, newType])
      setNewType("")
    }
  }

  const handleRemoveType = (typeToRemove: string) => {
    setTypes((prev) => prev.filter((type) => type !== typeToRemove))
  }

  const handleAddLink = () => {
    setSocialLinks(prev => [...prev, { platform: "", url: "" }])
  }

  const handleLinkChange = (index: number, field: keyof SocialLink, value: string) => {
    setSocialLinks(prev => 
      prev.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    )
  }

  const handleRemoveLink = (index: number) => {
    setSocialLinks(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Types de services</h3>
        <div className="flex space-x-2">
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
          >
            <option value="">Sélectionner un service</option>
            {PREDEFINED_SERVICES.filter(service => !types.includes(service)).map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
          <Button type="button" onClick={handleAddType}>
            Ajouter
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {types.map((type, index) => (
            <div key={index} className="flex items-center bg-primary text-primary-foreground px-2 py-1 rounded">
              <span className="px-2">{type}</span>
              <Button variant="ghost" size="sm" onClick={() => handleRemoveType(type)} className="ml-2 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Réseaux sociaux</h3>
        <div className="space-y-4">
          {socialLinks.map((link, index) => (
            <div key={index} className="flex items-center space-x-2">
              <select
                value={link.platform}
                onChange={(e) => handleLinkChange(index, "platform", e.target.value)}
                className="p-2 border rounded"
              >
                <option value="">Sélectionner un réseau</option>
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
                <option value="X">X</option>
                <option value="YouTube">YouTube</option>
                <option value="LinkedIn">LinkedIn</option>
              </select>
              <Input
                value={link.url}
                onChange={(e) => handleLinkChange(index, "url", e.target.value)}
                placeholder="Lien URL"
              />
              <Button type="button" onClick={() => handleRemoveLink(index)} variant="destructive" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" onClick={handleAddLink} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un réseau
          </Button>
        </div>
      </div>
    </div>
  )
}

