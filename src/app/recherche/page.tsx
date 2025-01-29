"use client"

import Image from 'next/image'
import SalonRecherche from "@/components/recherche"
import { Suspense } from 'react'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 overflow-auto">
        <section className="relative h-screen w-full">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-black/50 z-10" />
            <Image
              src="/salon.jpg"
              alt="Background"
              fill
              className="object-cover"
              priority
            />
          </div>
          
          <div className="relative z-20 h-full flex items-center justify-center" style={{ paddingBottom: '15vh' }}>
            <div className="container mx-auto px-4">
              <div className="flex flex-col items-center space-y-8 max-w-4xl mx-auto">
                <div className="text-center space-y-4">
                  <h2 className="text-5xl md:text-6xl lg:text-5xl font-bold text-white">
                    Rechercher un salon 
                  </h2>
                </div>
                <div className="w-full max-w-7xl">
                  <Suspense fallback={<div className="text-white">Chargement...</div>}>
                    <SalonRecherche />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

