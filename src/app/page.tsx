"use client"

import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Scissors, Calendar, Star,  ChevronRight, Check } from 'lucide-react'
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; // Assurez-vous que Supabase est bien configuré
import { useRouter } from 'next/navigation';

interface Salon {
  id: number;
  nom_salon: string;
  adresse: string;
  image_url: string;
}

export default function LandingPage() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchSalons = async () => {
      try {
        const { data, error } = await supabase.from('salons').select('*');
        if (error) throw new Error(error.message);

        setSalons(data || []);
      } catch (error) {
        console.error('Erreur lors de la récupération des salons :', error);
      }
    };

    fetchSalons();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1">
        <section className="w-full  py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-r from-primary to-primary-foreground">
          <div className="container px-12">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4 text-white">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    La beauté à portée de clic
                  </h1>
                  <p className="max-w-[600px] text-gray-200 md:text-xl">
                    Réservez votre coiffeur en quelques secondes. Plus de 1000 salons à votre disposition.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src="/salon.jpg"
                  width={800}
                  height={400}
                  alt="Illustration d&apos;une coiffeuse stylisant les cheveux d&apos;une cliente"
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">L&apos;expérience CoiffureClick</h2>
            <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-2 bg-primary/10 rounded-full">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Flexibilité totale</h3>
                <p className="text-gray-600">Réservez à tout moment, modifiez ou annulez sans frais jusqu&apos;à 24h avant le rendez-vous.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-2 bg-primary/10 rounded-full">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Expertise vérifiée</h3>
                <p className="text-gray-600">Tous nos coiffeurs sont certifiés et régulièrement évalués pour garantir un service de qualité.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-2 bg-primary/10 rounded-full">
                  <Scissors className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Styles personnalisés</h3>
                <p className="text-gray-600">Trouvez le coiffeur parfait pour votre style grâce à notre système de filtres avancés.</p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
          <div className="container px-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Nos coiffeurs vedettes</h2>
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              {salons.slice(0, 3).map((salon) => (
                <Card key={salon.id} className="bg-white shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                  <div className="relative h-48">
                    <Image
                      src={salon.image_url || "/placeholder.svg"}
                      alt={salon.nom_salon}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">{salon.nom_salon}</h3>
                    <p className="text-gray-500 mb-4">{salon.adresse}</p>
                    <Button variant="outline" className="w-full" onClick={() => router.push(`/dashboard/${salon.id}`)}>
                      Voir les disponibilités
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 items-center">
              <div className="space-y-4 mx-12">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Simplifiez votre routine beauté</h2>
                <p className="text-gray-600 md:text-lg">
                  Notre plateforme intuitive vous offre une expérience de réservation sans pareille. Découvrez nos fonctionnalités clés :
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Recherche avancée par style, prix et disponibilité</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Système de notation et avis clients détaillés</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Rappels automatiques et gestion de vos rendez-vous</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Paiement sécurisé en ligne</span>
                  </li>
                </ul>
                <Button className="mt-4" size="lg" onClick={() => router.push('/dashboard')}>
                  Découvrir la plateforme
                </Button>
              </div>
              <div className="flex justify-center lg:justify-end">
                <Image
                  src="/salon2.jpg"
                  width={400}
                  height={400}
                  alt="Interface de CoiffureClick"
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Prêt à simplifier vos réservations ?
                </h2>
                <p className="mx-auto max-w-[700px] text-primary-foreground/90 md:text-xl">
                  Rejoignez des milliers d&apos;utilisateurs satisfaits et commencez à réserver vos rendez-vous dès aujourd&apos;hui.
                </p>
              </div>
              <Button className="bg-background text-primary hover:bg-background/90" size="lg" onClick={() => router.push('/dashboard')}>
                Commencer maintenant
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-background">
        <div className="container flex flex-col gap-4 py-6 md:flex-row md:justify-between">
          <div className="flex flex-col gap-2">
            <Link className="flex items-center justify-center md:justify-start" href="#">
              <Scissors className="h-6 w-6 mr-2 text-primary" />
              <span className="font-bold">CoiffureClick</span>
            </Link>
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-sm hover:underline underline-offset-4" href="#">
              Conditions d&apos;utilisation
            </Link>
            <Link className="text-sm hover:underline underline-offset-4" href="#">
              Politique de confidentialité
            </Link>
            <Link className="text-sm hover:underline underline-offset-4" href="#">
              Nous contacter
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

