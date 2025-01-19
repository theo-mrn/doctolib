'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import SalonInfo from './SalonInfo'; 
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import SalonDetails from './SalonDetails';

type Salon = {
  id: string;  
  nom_salon: string;
  adresse: string;
  description: string;
  code_postal: string;
  ville: string;  
  lat?: number;
  lng?: number;
  image_url?: string;
  hours?: Record<string, string>;
  services?: string[];
  note: number;
  nombre_votes: number;
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
            <SalonDetails 
              salonId={parseInt(salon.id)} 
              salonName={salon.nom_salon}
              initialRating={salon.note || 0} 
              initialVotes={salon.nombre_votes || 0} 
              hours={salon.hours || defaultSalon.hours}
            />
          </div>
        </div>
      </div>
    </div>
  );
}