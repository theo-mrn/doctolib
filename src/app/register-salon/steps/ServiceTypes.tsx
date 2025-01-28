import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { SalonFormData, SocialLink } from "../SalonRegistrationForm"

interface ServiceTypesProps {
  step: 'service-types';
  formData: SalonFormData;
  setFormData: React.Dispatch<React.SetStateAction<SalonFormData>>;
}

export default function ServiceTypes({ formData, setFormData }: Omit<ServiceTypesProps, 'step'>) {
  const [types, setTypes] = useState(formData.types || [])
  const [newType, setNewType] = useState("")
  const [socialLinks, setSocialLinks] = useState<Record<string, SocialLink>>(formData.social_links || {})

  const handleAddType = () => {
    if (newType) {
      const updatedTypes = [...types, newType]
      setTypes(updatedTypes)
      setFormData({ ...formData, types: updatedTypes })
      setNewType("")
    }
  }

  const handleAddLink = () => {
    const newLink: SocialLink = { platform: "", url: "" }
    const key = Date.now().toString()
    setSocialLinks({ ...socialLinks, [key]: newLink })
    setFormData({ ...formData, social_links: { ...socialLinks, [key]: newLink } })
  }

  const handleLinkChange = (key: string, field: keyof SocialLink, value: string) => {
    const updatedLinks = { 
      ...socialLinks, 
      [key]: { ...socialLinks[key], [field]: value } 
    }
    setSocialLinks(updatedLinks)
    setFormData({ ...formData, social_links: updatedLinks })
  }

  const handleRemoveLink = (key: string) => {
    const newLinks = Object.fromEntries(
      Object.entries(socialLinks).filter(([k]) => k !== key)
    )
    setSocialLinks(newLinks)
    setFormData({ ...formData, social_links: newLinks })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Types de services</h3>
        <div className="flex space-x-2">
          <Input placeholder="Type de service" value={newType} onChange={(e) => setNewType(e.target.value)} />
          <Button type="button" onClick={handleAddType}>
            Ajouter
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {types.map((type, index) => (
            <div key={index} className="bg-primary text-primary-foreground px-2 py-1 rounded">
              {type}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Réseaux sociaux</h3>
        <div className="space-y-4">
          {Object.keys(socialLinks).map((key) => (
            <div key={key} className="flex items-center space-x-2">
              <select
                value={socialLinks[key].platform}
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
                value={socialLinks[key].url}
                onChange={(e) => handleLinkChange(key, "url", e.target.value)}
                placeholder="Lien URL"
              />
              <Button 
                onClick={() => handleRemoveLink(key)} 
                className="bg-red-600 hover:bg-red-800 text-white"
              >
                -
              </Button>
            </div>
          ))}
          <Button 
            onClick={handleAddLink} 
            className="flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Ajouter un réseau</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

