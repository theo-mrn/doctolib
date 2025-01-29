'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import SalonInfo from './SalonInfo'; 
import { ArrowLeft, MessageCircle, X } from 'lucide-react';
import SalonDetails from './SalonDetails';
import BeautyServices from './prestations';
import { Messagerie } from './Messagerie';
import SalonImages from "@/components/SalonImages";
import GalleryPrestationImages from "@/components/prestationimages";
import type { Salon } from '@/types/salon';

const defaultSalon: Partial<Salon> = {
  note: 0,
  nombre_votes: 0,
  types: [],
  social_links: null,
  pricing: {},  // Initialiser avec un objet vide plutôt qu'un tableau vide
  ouverture: null
};

export default function SalonBooking() {
  const { id } = useParams();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

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
        const daysOrder = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
        const hours = Object.fromEntries(
          daysOrder.map(day => {
            const dayData = data.ouverture?.[day.charAt(0).toUpperCase() + day.slice(1)] || { isOpen: false };
            if (!dayData.isOpen) {
              return [day, 'Fermé'];
            }
            const morning = dayData.morning ? `${dayData.morning.start} - ${dayData.morning.end}` : '';
            const afternoon = dayData.afternoon ? `${dayData.afternoon.start} - ${dayData.afternoon.end}` : '';
            return [day, [morning, afternoon].filter(Boolean).join(' / ')];
          })
        );
        setSalon({ 
          ...defaultSalon,
          ...data, 
          id: Number(data.id), 
          hours 
        });
      }
    };

    fetchSalon();
  }, [id]);

  if (!salon) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 to-teal-100 relative">
      <div className="container mx-auto px-4 py-4">
        <button 
          onClick={() => window.history.back()} 
          className="inline-flex items-center text-[#8b4513] font-bold bg-white p-3 rounded-lg hover:text-[#8B4513]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la liste des salons
        </button>
      </div>
      <div className="p-4">
        <SalonImages salonId={Number(id)} refresh={false} />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <SalonInfo salon={salon} /><br></br>
            <BeautyServices salon={{
              ...salon,
              id: salon.id.toString(),
            }} />
          </div>
          <div>
            <SalonDetails 
              salonId={salon.id} 
              salonName={salon.nom_salon}
              initialRating={salon.note || 0} 
              initialVotes={salon.nombre_votes || 0} 
              hours={salon.hours as Record<string, string>}
            /><br></br>
            <GalleryPrestationImages salonId={Number(id)} refresh={false} />
          </div>
        </div>
      </div>

      {/* Chat flottant */}
      <div className={`fixed right-0 bottom-0 h-[80vh] w-[400px] transition-transform duration-300 transform ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {isChatOpen && (
          <div className="h-full shadow-lg rounded-t-lg relative">
            <div className="absolute -top-12 right-0 p-2 bg-white rounded-t-lg shadow-lg">
              <button 
                onClick={() => setIsChatOpen(false)}
                className="hover:bg-gray-100 rounded-full p-2"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="h-full pt-2">
              <Messagerie 
                otherPersonName={salon?.nom_salon || ''} 
                salonId={Number(id)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bouton de chat flottant */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 bg-primary text-white rounded-full p-4 shadow-lg hover:bg-primary/90 transition-colors"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}