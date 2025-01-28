"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Info, Edit3, MapPin, Link, Plus } from "lucide-react"
import { FaFacebook, FaInstagram,  FaYoutube, FaLinkedin } from "react-icons/fa"
import { BsTwitterX } from "react-icons/bs";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import type { Salon } from "@/types/salon"

type Props = {
  salon: Salon
}

export default function SalonInfo({ salon }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedSalon, setEditedSalon] = useState(salon)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([])

  useEffect(() => {
    setEditedSalon(salon)
    setSocialLinks(Array.isArray(salon.social_links) ? salon.social_links : [])
    console.log("Réseaux sociaux chargés :", salon.social_links)
  }, [salon])

  const handleAddSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: "", url: "" }])
  }

  const handleRemoveSocialLink = (index: number) => {
    const newSocialLinks = socialLinks.filter((_, i) => i !== index)
    setSocialLinks(newSocialLinks)
  }

  const handleSocialLinkChange = (index: number, field: keyof typeof socialLinks[0], value: string) => {
    const newSocialLinks = [...socialLinks]
    newSocialLinks[index][field] = value
    setSocialLinks(newSocialLinks)
  }

  const handleSaveChanges = async () => {
    try {
      let imageUrl = editedSalon.image_url

      if (imageFile) {
        const { error: uploadError } = await supabase.storage
          .from("image_salons")
          .upload(`public/${salon.id}/${imageFile.name}`, imageFile)

        if (uploadError) {
          console.error("Erreur lors du téléchargement de l'image :", uploadError.message)
          return
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("image_salons").getPublicUrl(`public/${salon.id}/${imageFile.name}`)

        imageUrl = publicUrl
      }

      const updatedSalon = {
        nom_salon: editedSalon.nom_salon,
        adresse: editedSalon.adresse,
        description: editedSalon.description,
        code_postal: editedSalon.code_postal,
        ville: editedSalon.ville,
        image_url: imageUrl,
        social_links: socialLinks,
      }

      const { error } = await supabase
        .from("salons")
        .update(updatedSalon)
        .eq("id", salon.id)

      if (error) {
        console.error("Erreur lors de la mise à jour :", error.message)
      } else {
        console.log("Salon mis à jour avec succès.")
        setIsEditing(false)
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error)
    }
  }

  const SocialLink = ({ url, icon: Icon }: { url?: string; icon: React.ElementType }) => {
    if (!url) return null
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center text-gray-600 hover:text-[#8B4513] transition-colors"
      >
        <Icon className="h-5 w-5 mr-2" />
        <span>{url}</span>
      </a>
    )
  }

  const getIcon = (platform: string) => {
    switch (platform) {
      case "Facebook":
        return FaFacebook
      case "Instagram":
        return FaInstagram
      case "X":
        return BsTwitterX 
      case "YouTube":
        return FaYoutube
      case "LinkedIn":
        return FaLinkedin
      default:
        return Link
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {!isEditing ? (
            <>
              {/* Nom du salon */}
              <div>
                <h1 className="text-3xl font-bold text-[#4A332F] mb-3">{salon.nom_salon}</h1>
              </div>
              {/* Informations générales */}
              <div>
                <h4 className="text-xl font-serif text-[#4A332F] mb-3">À propos</h4>
                <div className="flex items-start text-gray-600">
                  <Info className="h-5 w-5 mr-2 mt-1 flex-shrink-0" />
                  <p>{salon.description}</p>
                </div>
              </div>

              <Separator />

              {/* Adresse */}
              <div>
                <h2 className="text-xl font-serif text-[#4A332F] mb-3">Adresse</h2>
                <div className="flex items-start text-gray-600">
                  <MapPin className="h-5 w-5 mr-2 mt-1 flex-shrink-0" />
                  <p>
                    {salon.adresse}, {salon.code_postal} {salon.ville}
                  </p>
                </div>
              </div>

              <Separator />
              <div>
                <h2 className="text-xl font-serif text-[#4A332F] mb-3">Réseaux sociaux</h2>
                <div className="space-y-2">
                  {socialLinks?.length > 0 ? (
                    socialLinks.map((link, index) => (
                      <SocialLink key={index} url={link.url} icon={getIcon(link.platform)} />
                    ))
                  ) : (
                    <p className="text-gray-500">Aucun réseau social ajouté</p>
                  )}
                </div>
              </div>

              <Button
                onClick={() => setIsEditing(true)}
                className="w-full bg-[#8B4513] hover:bg-[#6F3710] text-white mt-6"
              >
                <Edit3 className="w-5 h-5 mr-2" />
                Modifier les informations
              </Button>
            </>
          ) : (
            <>
              {/* Modifier les informations générales */}
              <div>
                <h2 className="text-xl font-serif text-[#4A332F] mb-3">Modifier les informations générales</h2>
                <Input
                  value={editedSalon.nom_salon}
                  onChange={(e) => setEditedSalon({ ...editedSalon, nom_salon: e.target.value })}
                  placeholder="Nom du salon"
                  className="mb-4"
                />
                <Textarea
                  value={editedSalon.description}
                  onChange={(e) => setEditedSalon({ ...editedSalon, description: e.target.value })}
                  placeholder="Description"
                  className="mb-4"
                />
                <Input
                  value={editedSalon.adresse}
                  onChange={(e) => setEditedSalon({ ...editedSalon, adresse: e.target.value })}
                  placeholder="Adresse"
                  className="mb-4"
                />
                <Input
                  value={editedSalon.code_postal}
                  onChange={(e) => setEditedSalon({ ...editedSalon, code_postal: e.target.value })}
                  placeholder="Code postal"
                  className="mb-4"
                />
                <Input
                  value={editedSalon.ville}
                  onChange={(e) => setEditedSalon({ ...editedSalon, ville: e.target.value })}
                  placeholder="Ville"
                  className="mb-4"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="mb-4"
                />
              </div>

              {/* Modifier les réseaux sociaux */}
              <div>
                <h2 className="text-xl font-serif text-[#4A332F] mb-3">Modifier les réseaux sociaux</h2>
                <div className="space-y-4">
                  {socialLinks.map((link, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <select
                        value={link.platform}
                        onChange={(e) => handleSocialLinkChange(index, "platform", e.target.value)}
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
                        onChange={(e) => handleSocialLinkChange(index, "url", e.target.value)}
                        placeholder="Lien URL"
                      />
                      <Button onClick={() => handleRemoveSocialLink(index)} className="bg-red-600 hover:bg-red-800 text-white">
                        -
                      </Button>
                    </div>
                  ))}
                  <Button onClick={handleAddSocialLink} className="flex items-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span>Ajouter un réseau</span>
                  </Button>
                </div>
              </div>

              <Button onClick={handleSaveChanges} className="w-full bg-green-600 hover:bg-green-800 text-white mt-6">
                Sauvegarder les modifications
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

