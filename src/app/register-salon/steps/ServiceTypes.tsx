import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, X, Check } from "lucide-react"
import { SalonFormData, SocialLink } from "../SalonRegistrationForm"
import { motion, AnimatePresence } from "framer-motion"

const PREDEFINED_SERVICES = [
  "Coiffeur", "Barbier", "Manucure", 
  "Pédicure", "Coloration",
  "Extensions", "Massage crânien", 
  "Epilation", "Maquillage", "Soins du visage", "Soins du corps", "Spa", 
  "Tatouage", "Piercing", "Soins des pieds", "Soins des mains", "Onglerie", 
  "Beauté des pieds", "Relooking"
]

interface ServiceTypesProps {
  step: 'service-types';
  formData: SalonFormData;
  setFormData: React.Dispatch<React.SetStateAction<SalonFormData>>;
}

export default function ServiceTypes({ formData, setFormData }: Omit<ServiceTypesProps, 'step'>) {
  const [types, setTypes] = useState(formData.types || [])
  const [socialLinks, setSocialLinks] = useState<Record<string, SocialLink>>(formData.social_links || {})

  const toggleService = (service: string) => {
    const updatedTypes = types.includes(service)
      ? types.filter(t => t !== service)
      : [...types, service]
    setTypes(updatedTypes)
    setFormData({ ...formData, types: updatedTypes })
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
    <div className="space-y-12">
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold text-white text-center">
          Sélectionnez vos services
        </h3>
        
        <motion.div 
          className="flex flex-wrap gap-3 max-w-[570px] mx-auto"
          layout
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
            mass: 0.5,
          }}
        >
          {PREDEFINED_SERVICES.map((service) => {
            const isSelected = types.includes(service)
            return (
              <motion.button
                type="button"  // Ajout de cette ligne
                key={service}
                onClick={() => toggleService(service)}
                layout
                initial={false}
                animate={{
                  backgroundColor: isSelected ? "rgb(2, 6, 23)" : "rgba(39, 39, 42, 0.5)",
                }}
                whileHover={{
                  backgroundColor: isSelected ? "rgb(3, 7, 24)" : "rgba(39, 39, 42, 0.8)",
                }}
                whileTap={{
                  backgroundColor: isSelected ? "rgb(1, 4, 16)" : "rgba(39, 39, 42, 0.9)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  mass: 0.5,
                  backgroundColor: { duration: 0.1 },
                }}
                className={`
                  inline-flex items-center px-4 py-2 rounded-full text-base font-medium
                  whitespace-nowrap overflow-hidden ring-1 ring-inset
                  ${isSelected 
                    ? "text-blue-400 ring-[hsla(0,0%,100%,0.12)]" 
                    : "text-white ring-[hsla(0,0%,100%,0.06)]"}
                `}
              >
                <motion.div 
                  className="relative flex items-center"
                  animate={{ 
                    width: isSelected ? "auto" : "100%",
                    paddingRight: isSelected ? "1.5rem" : "0",
                  }}
                  transition={{
                    ease: [0.175, 0.885, 0.32, 1.275],
                    duration: 0.3,
                  }}
                >
                  <span>{service}</span>
                  <AnimatePresence>
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 500, 
                          damping: 30, 
                          mass: 0.5 
                        }}
                        className="absolute right-0"
                      >
                        <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-black" strokeWidth={1.5} />
                        </div>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.button>
            )
          })}
        </motion.div>
      </div>

      <div className="space-y-6 max-w-[570px] mx-auto">
        <h3 className="text-2xl font-semibold text-white text-center">
          Vos réseaux sociaux
        </h3>
        <div className="space-y-4">
          {Object.keys(socialLinks).map((key) => (
            <motion.div 
              key={key} 
              className="flex items-center space-x-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <select
                value={socialLinks[key].platform}
                onChange={(e) => handleLinkChange(key, "platform", e.target.value)}
                className="p-2 rounded-full bg-zinc-900/50 text-white border border-[hsla(0,0%,100%,0.12)]"
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
                className="rounded-full bg-zinc-900/50 text-white border-[hsla(0,0%,100%,0.12)]"
              />
              <Button 
                onClick={() => handleRemoveLink(key)} 
                className="rounded-full bg-zinc-900 text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
          <Button 
            onClick={handleAddLink} 
            className="w-full rounded-full bg-zinc-900 text-white hover:bg-zinc-800 flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Ajouter un réseau</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

