'use client'

import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Clock, Scissors, User, Mail, Phone, Check } from 'lucide-react'
import Link from 'next/link'

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  
  const salonName = searchParams.get('salonName')
  const salonAddress = searchParams.get('salonAddress')
  const service = searchParams.get('service')
  const date = searchParams.get('date') ? new Date(searchParams.get('date')!) : null
  const time = searchParams.get('time')
  const fullName = searchParams.get('fullName')
  const phone = searchParams.get('phone')

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="border-2 border-[#8B4513]">
        <CardHeader className="text-center border-b border-gray-200">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="h-6 w-6 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-serif text-[#4A332F]">
            Votre rendez-vous est confirmé !
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Scissors className="w-5 h-5 mt-1 text-[#8B4513]" />
              <div>
                <p className="font-medium">Salon</p>
                <p className="text-gray-600">{salonName}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 mt-1 text-[#8B4513]" />
              <div>
                <p className="font-medium">Adresse</p>
                <p className="text-gray-600">{salonAddress}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 mt-1 text-[#8B4513]" />
              <div>
                <p className="font-medium">Date</p>
                <p className="text-gray-600">{date ? formatDate(date) : ''}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 mt-1 text-[#8B4513]" />
              <div>
                <p className="font-medium">Heure</p>
                <p className="text-gray-600">{time}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Scissors className="w-5 h-5 mt-1 text-[#8B4513]" />
              <div>
                <p className="font-medium">Service</p>
                <p className="text-gray-600">{service}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="font-medium mb-3">Vos informations</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{fullName}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{phone}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Link href="/dashboard">
              <Button className="w-full bg-[#8B4513] hover:bg-[#6F3710] text-white">
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

