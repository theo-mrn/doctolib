"use client"
import SalonRecherche from "@/components/recherche"

export default function Page() {
  return (
    <main className="overflow-hidden relative min-h-screen flex items-center justify-center">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black/40" />
        <img
          src="/salon.jpg"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
          Rechercher
        </h1>
        <div className="max-w-3xl mx-auto">
          <SalonRecherche />
        </div>
      </div>
    </main>
  )
}
