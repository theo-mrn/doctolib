'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import SalonInfo from './SalonInfo'; 
import { ArrowLeft, MessageCircle, X, Edit } from 'lucide-react';
import SalonDetails from './SalonDetails';
import BeautyServices from './prestations';
import { Messagerie } from './Messagerie';
import SalonImages from "@/components/SalonImages";
import GalleryPrestationImages from "@/components/prestationimages";
import type { Salon } from '@/types/salon';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CommentsSection from './comment';
import ImageCarousel from "@/components/ImageCarousel";
import PrestationCarousel from "@/components/PrestationCarousel";

const defaultSalon: Partial<Salon> = {
  note: 0,
  nombre_votes: 0,
  types: [],
  social_links: null,
  pricing: {},  // Initialiser avec un objet vide plutôt qu'un tableau vide
  ouverture: null,
  is_verified: false
};

export default function SalonBooking() {
  const params = useParams();
  // Extraire l'ID correctement depuis les paramètres et s'assurer qu'il est un nombre
  const salonId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [salon, setSalon] = useState<Salon | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchSalonAndCheckOwner = async () => {
      try {
        // Vérifier la session
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        // Récupérer les données du salon avec l'ID converti en nombre
        const { data: salonData, error } = await supabase
          .from('salons')
          .select('*')
          .eq('id', Number(salonId))
          .single();

        if (error) {
          console.error('Erreur lors de la récupération du salon :', error.message);
          return;
        }

        // Traitement des heures d'ouverture
        const daysOrder = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
        const hours = Object.fromEntries(
          daysOrder.map(day => {
            const dayData = salonData.ouverture?.[day.charAt(0).toUpperCase() + day.slice(1)] || { isOpen: false };
            if (!dayData.isOpen) {
              return [day, 'Fermé'];
            }
            const morning = dayData.morning ? `${dayData.morning.start} - ${dayData.morning.end}` : '';
            const afternoon = dayData.afternoon ? `${dayData.afternoon.start} - ${dayData.afternoon.end}` : '';
            return [day, [morning, afternoon].filter(Boolean).join(' / ')];
          })
        );

        // Mettre à jour le salon et vérifier si l'utilisateur est propriétaire
        const completeSalon = { 
          ...defaultSalon,
          ...salonData, 
          id: Number(salonData.id), 
          hours 
        };
        setSalon(completeSalon);
        
        // Vérifier si l'utilisateur est le propriétaire
        setIsOwner(userId === salonData.professionnel_id);
      } catch (error) {
        console.error('Erreur inattendue:', error);
      }
    };

    if (salonId) {
      fetchSalonAndCheckOwner();
    }
  }, [salonId]);

  if (!salon) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 to-teal-100 relative">
      {!salon.is_verified && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
          <p className="font-medium">Ce salon est en cours de vérification</p>
          <p className="text-sm">Notre équipe examine actuellement les informations de ce salon pour validation.</p>
        </div>
      )}
      
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => window.history.back()} 
            className="inline-flex items-center text-[#8b4513] font-bold bg-white p-2 sm:p-3 rounded-lg hover:text-[#8B4513] text-sm sm:text-base"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Retour
          </button>
          {isOwner && (
            <Link
              href={`/dashboard/${salonId}/edit`}
              className="inline-flex items-center text-primary font-medium bg-white/80 px-4 py-2 rounded-lg hover:bg-white transition-colors"
            >
              <Edit className="mr-2 h-4 w-4" />
              Modifier le salon
            </Link>
          )}
        </div>
      </div>
      <div className="p-2 sm:p-4">
        <div className="block md:hidden">
          {salonId && <ImageCarousel salonId={salonId} />}
        </div>
        <div className="hidden md:block">
          <SalonImages salonId={Number(salonId)} refresh={false} />
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
          <div>
            <SalonInfo salon={salon} /><br></br>
            <BeautyServices salon={{
              ...salon,
              id: salon.id.toString(),
            }} />
          </div>
          <div>
            <Tabs defaultValue="ratings" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="ratings" className="w-full">Notes</TabsTrigger>
                <TabsTrigger value="comments" className="w-full">Commentaires</TabsTrigger>
              </TabsList>
              <TabsContent value="ratings">
                <SalonDetails 
                  salonId={salon.id} 
                  salonName={salon.nom_salon}
                  initialRating={salon.note || 0} 
                  initialVotes={salon.nombre_votes || 0} 
                  hours={salon.hours as Record<string, string>}
                />
              </TabsContent>
              <TabsContent value="comments">
                <CommentsSection salonId={salon.id} />
              </TabsContent>
            </Tabs>
            <br></br>
            <div className="block md:hidden">
              {salonId && <PrestationCarousel salonId={salonId} />}
            </div>
            <div className="hidden md:block">
              <GalleryPrestationImages salonId={Number(salonId)} refresh={false} />
            </div>
          </div>
        </div>
      </div>

      {/* Chat flottant */}
      <div className={`fixed right-0 bottom-0 h-[70vh] w-[90vw] sm:w-[400px] transition-transform duration-300 transform ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
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
                salonId={Number(salonId)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bouton de chat flottant */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-4 right-4 bg-primary text-white rounded-full p-3 shadow-lg hover:bg-primary/90 transition-colors"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}