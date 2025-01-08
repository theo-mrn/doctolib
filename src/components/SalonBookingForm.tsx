'use client';

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card'; 
import { supabase } from '@/lib/supabase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';

type Props = {
  salon: {
    id: number;
    nom_salon: string;
    adresse: string;
    prestations?: string[];
  };
};

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
];

type Service = {
  name: string;
  options: string[];
};

const fetchServices = async (salonId: number): Promise<string[]> => {
  const { data, error } = await supabase
    .from('salons')
    .select('prestations')
    .eq('id', salonId)
    .single();

  if (error) {
    console.error('❌ Erreur lors de la récupération des prestations :', error.message);
    return [];
  }

  return data.prestations || [];
};

export default function SalonBookingForm({ salon }: Props) {
  const [date, setDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [phone, setPhone] = useState('');
  const [reservedSlots, setReservedSlots] = useState<string[]>([]);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [services, setServices] = useState<string[]>(salon.prestations || []);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const router = useRouter();

 
  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('❌ Erreur lors de la récupération de l\'utilisateur:', authError?.message);
        return;
      }

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('prenom, nom, telephone')
        .eq('id', user.id);

      if (profileError) {
        console.error('❌ Erreur lors de la récupération du profil:', profileError.message);
      } else if (profiles && profiles.length === 1) {
        const profile = profiles[0];
        setPrenom(profile.prenom);
        setNom(profile.nom);
        setPhone(profile.telephone);
      } else if (profiles && profiles.length === 0) {
        setProfileError('❌ Aucun profil trouvé pour cet utilisateur.');
      } else {
        setProfileError('❌ Plusieurs profils trouvés pour cet utilisateur.');
      }
    };

    fetchUserProfile();
  }, []);

 
  const fetchReservedSlots = async (selectedDate: Date) => {
    if (!selectedDate) return;

    const formattedDate = selectedDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('reservations')
      .select('time')
      .eq('salon_id', salon.id)
      .eq('date', formattedDate);

    if (error) {
      console.error('❌ Erreur lors de la récupération des créneaux réservés :', error.message);
      return;
    }

    const normalizedSlots = data.map((res: { time: string }) => res.time.slice(0, 5));
    setReservedSlots(normalizedSlots);
  };

 
  useEffect(() => {
    if (date) {
      fetchReservedSlots(date);
    }
  }, [date, salon.id]);

  useEffect(() => {
    const loadServices = async () => {
      const services = await fetchServices(salon.id);
      setServices(services);
    };

    loadServices();
  }, [salon.id]);

  const handleOptionChange = (serviceName: string, option: string) => {
    setSelectedOptions((prev) => ({ ...prev, [serviceName]: option }));
  };

 
  const handleSubmit = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Erreur lors de la récupération de l\'utilisateur:', authError?.message);
      return;
    }

    if (date && selectedTime && selectedService && prenom && nom && phone) {
      const formattedDate = date.toISOString().split('T')[0];

      if (reservedSlots.includes(selectedTime)) {
        alert('⚠️ Ce créneau est déjà réservé. Veuillez en choisir un autre.');
        return;
      }

      const { error } = await supabase
        .from('reservations')
        .insert([
          {
            salon_id: salon.id,
            client_id: user.id, 
            date: formattedDate,
            time: selectedTime,
            service: selectedService,
            full_name: `${prenom} ${nom}`,
            phone: phone,
          },
        ]);

      if (error) {
        console.error('❌ Erreur lors de l\'enregistrement de la réservation :', error.message);
      } else {
        setReservedSlots((prev) => [...prev, selectedTime]);
        setSelectedTime(null);
        router.push(`/confirmation?salonName=${encodeURIComponent(salon.nom_salon)}&salonAddress=${encodeURIComponent(salon.adresse)}&service=${encodeURIComponent(selectedService)}&date=${encodeURIComponent(formattedDate)}&time=${encodeURIComponent(selectedTime)}&fullName=${encodeURIComponent(`${prenom} ${nom}`)}&phone=${encodeURIComponent(phone)}`);
      }
    } else {
      alert('⚠️ Merci de remplir toutes les informations avant de confirmer.');
    }
  };

  if (profileError) {
    return <div className="container mx-auto py-10"><h1 className="text-3xl font-bold mb-6">{profileError}</h1></div>
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-serif text-[#4A332F] mb-6">Réserver un rendez-vous</h2>

        <div>
          <h3 className="text-lg font-medium text-[#4A332F] mb-3">1. Choisissez un service</h3>
          <Select onValueChange={(value) => setSelectedService(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionnez un service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service, index) => (
                <SelectItem key={index} value={service}>
                  {service}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>


        <div>
          <h3 className="text-lg font-medium text-[#4A332F] mb-3">2. Choisissez une date</h3>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              setDate(newDate);
              fetchReservedSlots(newDate);
            }}
            className="rounded-md border mx-auto"
          />
        </div>


        {date && (
          <div>
            <h3 className="text-lg font-medium text-[#4A332F] mb-3">3. Choisissez un horaire</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={reservedSlots.includes(time) ? 'outline' : selectedTime === time ? 'default' : 'outline'}
                  className={
                    reservedSlots.includes(time)
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : selectedTime === time
                      ? 'bg-[#8B4513] text-white'
                      : ''
                  }
                  disabled={reservedSlots.includes(time)}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        )}

     
        <div>
          <h3 className="text-lg font-medium text-[#4A332F] mb-3">4. Vos informations</h3>
          <label className="block text-sm font-medium text-gray-700">Prénom</label>
          <Input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} /><br></br>
          <label className="block text-sm font-medium text-gray-700">Nom</label>
          <Input type="text" value={nom} onChange={(e) => setNom(e.target.value)} /><br></br>
          <label className="block text-sm font-medium text-gray-700">Téléphone</label>
          <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /><br></br>
        </div>

   
        <Button
          className="w-full bg-[#8B4513] hover:bg-[#6F3710] text-white mt-6"
          disabled={!date || !selectedTime || !selectedService || !prenom || !nom || !phone}
          onClick={handleSubmit}
        >
          Confirmer le rendez-vous
        </Button>
      </CardContent>
    </Card>
  );
}