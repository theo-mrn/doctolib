"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Info, MapPin, Link } from "lucide-react"
import { FaFacebook, FaInstagram, FaYoutube, FaLinkedin } from "react-icons/fa"
import { BsTwitterX } from "react-icons/bs";
import type { Salon } from "@/types/salon"

type Props = {
  salon: Salon
}

export default function SalonInfo({ salon }: Props) {
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([])

  useEffect(() => {
    setSocialLinks(Array.isArray(salon.social_links) ? salon.social_links : [])
    console.log("Réseaux sociaux chargés :", salon.social_links)
  }, [salon])

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
        </div>
      </CardContent>
    </Card>
  )
}

