'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Star, Calendar, Search, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const salons = [
  {
    id: 1,
    name: "Studio Jean Michel",
    address: "123 rue de la Coiffure, Paris",
    rating: 4.8,
    image: "/placeholder.svg?height=300&width=400",
    services: ["Coupe Homme", "Barbe", "Coloration"]
  },
  {
    id: 2,
    name: "L'Atelier d'Emma",
    address: "45 avenue des Styles, Paris",
    rating: 4.9,
    image: "/placeholder.svg?height=300&width=400",
    services: ["Coupe Femme", "Balayage", "Chignon"]
  },
  {
    id: 3,
    name: "Salon Belle & Zen",
    address: "78 boulevard Haussmann, Paris",
    rating: 4.7,
    image: "/placeholder.svg?height=300&width=400",
    services: ["Coupe Femme", "Massage", "Soin"]
  },
  {
    id: 4,
    name: "Test",
    address: "47 avenue des Styles, Lyon",
    rating: 4.8,
    image: "/placeholder.svg?height=300&width=400",
    services: ["Coupe Homme", "Balayage", "Chignon"]
  }
]

export default function SalonList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [locationTerm, setLocationTerm] = useState('')

  const filteredSalons = salons.filter(salon => 
    (salon.name.toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm === '') &&
    (salon.address.toLowerCase().includes(locationTerm.toLowerCase()) || locationTerm === '')
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif text-[#4A332F] mb-4">
          Trouvez votre coiffeur idéal
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Réservez facilement votre prochain rendez-vous chez les meilleurs coiffeurs près de chez vous
        </p>
        
        <div className="max-w-4xl mx-auto relative flex gap-2 mb-8">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Nom du salon"
              className="w-full h-14 pl-12 pr-4 rounded-l-full border-2 border-[#8B4513] focus:border-[#8B4513] focus:ring-[#8B4513]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
          </div>
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Où ?"
              className="w-full h-14 pl-12 pr-4 border-2 border-[#8B4513] focus:border-[#8B4513] focus:ring-[#8B4513]"
              value={locationTerm}
              onChange={(e) => setLocationTerm(e.target.value)}
            />
            <MapPin className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
          </div>
          <Button 
            className="h-14 px-6 bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded-r-full flex items-center gap-2"
          >
            Rechercher
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <h2 className="text-2xl font-serif text-[#4A332F] mb-6">Coiffeurs populaires</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSalons.map(salon => (
          <Card key={salon.id} className="overflow-hidden border-none shadow-lg">
            <div className="relative h-48">
              <img
                src={salon.image}
                alt={salon.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-white px-2 py-1 rounded-full">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">{salon.rating}</span>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="text-xl font-semibold mb-2">{salon.name}</h3>
              <div className="flex items-start gap-2 text-gray-600 mb-4">
                <MapPin className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{salon.address}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {salon.services.map(service => (
                  <span
                    key={service}
                    className="px-3 py-1 bg-[#F5E6E0] text-[#8B4513] rounded-full text-sm"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Link href={`/salon/${salon.id}`} className="w-full">
                <Button 
                  className="w-full bg-[#8B4513] hover:bg-[#6F3710] text-white flex items-center justify-center gap-2"
                >
                  <Calendar className="h-5 w-5" />
                  Prendre RDV
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

