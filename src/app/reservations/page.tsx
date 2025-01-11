"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AppointmentList from '@/components/mesrendezvous';

export interface Appointment {
  id: number;
  full_name: string;
  client_id: string;
  date: string;
  time: string;
  duree: number;
  salons: {
    nom_salon: string;
    adresse: string;
  };
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!userId) return;
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          salons (
            nom_salon,
            adresse
          )
        `)
        .eq('client_id', userId);

      if (error) {
        console.error('Erreur lors de la récupération des rendez-vous:', error.message);
      } else {
        setAppointments(data);
      }
    };

    fetchAppointments();
  }, [userId]);

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-2 text-center">Mes Rendez-vous</h1>
      <p className="text-muted-foreground text-center mb-10">
        Gérez vos rendez-vous chez le coiffeur en un clin d&apos;œil
      </p>
      {appointments.length === 0 ? (
        <div className="text-center">
          <p className="mb-4">Vous n&apos;avez pas de rendez-vous pour le moment.</p>
          <button 
             className="w-full bg-[#8B4513] hover:bg-[#6F3710] text-white flex items-center justify-center gap-2 rounded-lg p-3"
            onClick={() => router.push('/dashboard')}
          >
            Prendre RDV
          </button>
        </div>
      ) : (
        <AppointmentList appointments={appointments} />
      )}
    </div>
  );
}