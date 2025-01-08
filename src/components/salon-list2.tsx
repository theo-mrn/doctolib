'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; 
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { Input } from "@/components/ui/input"; 
import { Calendar } from '@/components/ui/calendar';
import { format, startOfWeek, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

type Salon = {
  id: number;
  nom_salon: string;
  adresse: string;
  image_url?: string;
  note?: number;
};

export default function SalonList() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Salon[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [reservedSlots, setReservedSlots] = useState<string[]>([]);
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [expandedDays, setExpandedDays] = useState<{ [key: string]: boolean }>({});
  const [showAllSlots, setShowAllSlots] = useState(false);
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
  ];
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

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

  const fetchReservedSlots = async (selectedDate: Date) => {
    if (!selectedDate) return;

    const formattedDate = selectedDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('reservations')
      .select('time')
      .eq('date', formattedDate);

    if (error) {
      console.error('❌ Erreur lors de la récupération des créneaux réservés :', error.message);
      return;
    }

    const normalizedSlots = data.map((res: { time: string }) => res.time.slice(0, 5));
    setReservedSlots(normalizedSlots);
  };

  useEffect(() => {
    if (selectedDate) {
      fetchReservedSlots(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const dates = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    setWeekDates(dates);
  }, []);

  const fetchReservedSlotsForWeek = async (salonId: number) => {
    const slots: { [key: string]: string[] } = {};

    for (const date of weekDates) {
      const formattedDate = date.toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('reservations')
        .select('time')
        .eq('salon_id', salonId)
        .eq('date', formattedDate);

      if (error) {
        console.error('❌ Erreur lors de la récupération des créneaux réservés :', error.message);
        continue;
      }

      slots[formattedDate] = data.map((res: { time: string }) => res.time.slice(0, 5));
    }

    return slots;
  };

  const [salonSlots, setSalonSlots] = useState<{ [key: number]: { [key: string]: string[] } }>({});

  useEffect(() => {
    const fetchAllSlots = async () => {
      const slots: { [key: number]: { [key: string]: string[] } } = {};
      for (const salon of salons) {
        slots[salon.id] = await fetchReservedSlotsForWeek(salon.id);
      }
      setSalonSlots(slots);
    };

    if (salons.length > 0) {
      fetchAllSlots();
    }
  }, [salons, weekDates]);

  // Gestion de la redirection
  const handleRedirect = (id: number) => {
    const currentPath = window.location.pathname;
    router.push(`${currentPath}/${id}`);

  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 0) {
      const filtered = salons.filter(salon =>
        salon.nom_salon.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (salon: Salon) => {
    setSearchTerm(salon.nom_salon);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const toggleExpandDay = (date: string) => {
    setExpandedDays((prev) => ({ ...prev, [date]: !prev[date] }));
  };

  const toggleShowAllSlots = () => {
    setShowAllSlots((prev) => !prev);
  };

  const filteredSalons = salons.filter(salon =>
    salon.nom_salon.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl md:text-5xl font-serif text-[#4A332F] mb-6">Liste des Salons</h1>
      
      <div className="mb-8 relative">
        <Input
          type="text"
          placeholder="Rechercher un salon..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full p-6 text-2xl border border-gray-300 rounded-lg shadow-md"
          ref={inputRef}
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-md mt-2 max-h-60 overflow-y-auto">
            {suggestions.map((salon) => (
              <li
                key={salon.id}
                className="p-4 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSuggestionClick(salon)}
              >
                {salon.nom_salon}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {filteredSalons.map((salon) => (
          <Card key={salon.id} className="overflow-hidden border-none shadow-lg flex flex-col md:flex-row">
            <div className="p-4 md:w-1/2 flex flex-col justify-between">
              <CardContent className="p-4">
                <h3 className="text-xl font-semibold mb-2">{salon.nom_salon}</h3>
                <div className="flex items-start gap-2 text-gray-600 mb-4">
                  <MapPin className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>{salon.adresse}</span>
                </div>
                <div className="relative h-48">
                  <img
                    src={salon.image_url || "/placeholder.svg"}
                    alt={salon.nom_salon}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-white px-2 py-1 rounded-full">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{salon.note || "N/A"}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button
                  className="w-full bg-[#8B4513] hover:bg-[#6F3710] text-white flex items-center justify-center gap-2"
                  onClick={() => handleRedirect(salon.id)}
                >
                  <CalendarIcon className="h-5 w-5" />
                  Voir le Salon
                </Button>
              </CardFooter>
            </div>
            <div className="p-4 md:w-1/2">
              <div className="grid grid-cols-1 sm:grid-cols-7 gap-4">
                {weekDates.map((date) => {
                  const formattedDate = date.toISOString().split('T')[0];
                  const reservedSlots = salonSlots[salon.id]?.[formattedDate] || [];
                  const slotsToShow = showAllSlots ? timeSlots : timeSlots.slice(0, 6);
                  return (
                    <div key={formattedDate}>
                      <h4 className="text-md font-medium text-gray-700">{format(date, 'EEEE', { locale: fr })}</h4>
                      <h5 className="text-sm text-gray-500">{format(date, 'dd MMMM', { locale: fr })}</h5>
                      <div className="flex flex-col gap-2">
                        {slotsToShow.map((time) => (
                          <Button
                            key={time}
                            variant={reservedSlots.includes(time) ? 'outline' : 'default'}
                            className={
                              reservedSlots.includes(time)
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-[#8B4513] text-white'
                            }
                            disabled={reservedSlots.includes(time)}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              {timeSlots.length > 6 && (
                <div className="flex justify-center mt-4">
                  <Button
                    variant="link"
                    className="text-[#8B4513] hover:text-[#6F3710]"
                    onClick={toggleShowAllSlots}
                  >
                    {showAllSlots ? 'Voir moins' : 'Voir plus'}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}