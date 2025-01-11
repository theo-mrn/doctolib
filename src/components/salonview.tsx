'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import SalonInfo from './SalonInfo'; 
import SalonBookingForm from './SalonBookingForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import SalonRating from './SalonRating';
import { Messagerie } from '@/components/Messagerie'


type Salon = {
  id: string;  // Changé de number à string
  nom_salon: string;
  adresse: string;
  description: string;
  code_postal: string;
  ville: string;  // Ajout de la propriété ville
  lat?: number;
  lng?: number;
  image_url?: string;
  hours?: Record<string, string>;
  services?: string[];
  note: number;  // Retiré l'optionnel pour correspondre au type attendu
  nombre_votes: number;  // Retiré l'optionnel pour correspondre au type attendu
};

const defaultSalon: Partial<Salon> = {
  hours: {
    lundi: '9:00 - 19:00',
    mardi: '9:00 - 19:00',
    mercredi: '9:00 - 19:00',
    jeudi: '9:00 - 19:00',
    vendredi: '9:00 - 20:00',
    samedi: '9:00 - 18:00',
    dimanche: 'Fermé',
  },
  services: [],
};

export default function SalonBooking() {
  const { id } = useParams();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const blurAmount = '7px'; 

  
  useEffect(() => {
    const fetchSalon = async () => {
      const { data, error } = await supabase
        .from('salons')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du salon :', error.message);
      } else {
        setSalon({ ...data, ...defaultSalon });
      }
    };

    fetchSalon();
  }, [id]);

  if (!salon) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="absolute inset-0" style={{ backgroundImage: `url(${salon.image_url || '/placeholder.svg'})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: `blur(${blurAmount})` }} />
      
      <div className="relative">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center text-[#8b4513] font-bold bg-white p-3 rounded-lg hover:text-[#8B4513]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste des salons
          </Link>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-8">
            <SalonInfo salon={salon} />
            <div className="flex flex-col items-center">
              <SalonRating 
                salonId={parseInt(salon.id)} 
                initialRating={salon.note || 0} 
                initialVotes={salon.nombre_votes || 0} 
              />
              <div className="bg-white p-6 rounded-lg shadow-lg w-full space-y-4 mt-6">
                <h2 className="text-xl font-serif text-[#4A332F] mb-3">Réservation</h2>
                <p className="text-gray-600">
                  Réservez votre rendez-vous en ligne en quelques clics. Choisissez le service souhaité et l&apos;heure qui vous convient.
                </p>
                <button
                  onClick={() => setIsBookingFormOpen(true)}
                  className="bg-[#8b4513] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#8B4513] w-full"
                >
                  Réserver
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg w-full space-y-4 mt-6">
                <h2 className="text-xl font-serif text-[#4A332F] mb-3">Messagerie</h2>
                <Messagerie 
                  salonId={parseInt(salon.id)} 
                  otherPersonName={salon.nom_salon}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {isBookingFormOpen && (
        <div className="fixed inset-0 z-30 bg-white p-8 overflow-auto">
          <button
            onClick={() => setIsBookingFormOpen(false)}
            className="absolute top-4 right-4 text-[#8b4513] font-bold"
          >
            Fermer
          </button>
          <SalonBookingForm salon={salon} />
        </div>
      )}
    </div>
  );
}