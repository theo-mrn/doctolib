"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import type { Salon, SocialLink } from "@/types/salon"

type ServiceTypesValue = string[] | Record<string, SocialLink>

interface ServiceTypesProps {
  formData: Salon
  updateFormData: (field: keyof Salon, value: ServiceTypesValue) => void
}

export default function ServiceTypes({ formData, updateFormData }: ServiceTypesProps) {
  const [types, setTypes] = useState(formData.types || [])
  const [newType, setNewType] = useState("")
  const [socialLinks, setSocialLinks] = useState<Record<string, SocialLink>>(formData.social_links || {})

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

  const handleEditType = (index: number, newValue: string) => {
    setTypes((prev) => prev.map((type, i) => (i === index ? newValue : type)))
  }

  const handleAddLink = () => {
    const newLink: SocialLink = { platform: "", url: "" }
    const key = Date.now().toString()
    setSocialLinks((prev) => ({ ...prev, [key]: newLink }))
  }

  const handleLinkChange = (key: string, field: keyof SocialLink, value: string) => {
    setSocialLinks((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }))
  }

  const handleRemoveLink = (key: string) => {
    setSocialLinks((prev) => {
      const newLinks = { ...prev }
      delete newLinks[key]
      return newLinks
    })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Types de services</h3>
        <div className="flex space-x-2">
          <Input placeholder="Nouveau type de service" value={newType} onChange={(e) => setNewType(e.target.value)} />
          <Button type="button" onClick={handleAddType}>
            Ajouter
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {types.map((type, index) => (
            <div key={index} className="flex items-center bg-primary text-primary-foreground px-2 py-1 rounded">
              <Input
                value={type}
                onChange={(e) => handleEditType(index, e.target.value)}
                className="bg-transparent border-none text-primary-foreground w-auto min-w-0"
              />
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
          {Object.entries(socialLinks).map(([key, link]) => (
            <div key={key} className="flex items-center space-x-2">
              <select
                value={link.platform}
                onChange={(e) => handleLinkChange(key, "platform", e.target.value)}
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
                onChange={(e) => handleLinkChange(key, "url", e.target.value)}
                placeholder="Lien URL"
              />
              <Button onClick={() => handleRemoveLink(key)} variant="destructive" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button onClick={handleAddLink} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un réseau
          </Button>
        </div>
      </div>
    </div>
  )
}

