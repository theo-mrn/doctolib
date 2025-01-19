'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star, CalendarIcon } from 'lucide-react';
import { Input } from "@/components/ui/input";
import Image from 'next/image';
import { format } from 'date-fns';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

// Hardcoded API key (temporary solution)
const GOOGLE_MAPS_API_KEY = 'AIzaSyBXn4swG2df3ijBKYswj29sq4mQt_HoZyQ';

type Salon = {
  id: number;
  nom_salon: string;
  adresse: string;
  code_postal: string;
  image_url?: string;
  note?: number;
  latitude?: number;
  longitude?: number;
};

type SalonWithNextSlot = Salon & { nextAvailableSlot?: string };

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: 48.8566, // Paris latitude
  lng: 2.3522 // Paris longitude
};

export default function SalonList() {
  const [salons, setSalons] = useState<SalonWithNextSlot[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Salon[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hoveredSalon, setHoveredSalon] = useState<SalonWithNextSlot | null>(null);
  const [selectedSalon, setSelectedSalon] = useState<SalonWithNextSlot | null>(null);
  const [codePostal, setCodePostal] = useState<string | null>(null);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const codePostalParam = query.get('codePostal');
    setCodePostal(codePostalParam);
  }, []);

  useEffect(() => {
    const fetchSalons = async () => {
      try {
        const { data, error } = await supabase.from('salons').select('*');
        if (error) throw new Error(error.message);
        
        if (!data) {
          setError('No salon data available.');
          return;
        }

        const salonsWithSlots = await Promise.all(
          data.map(async (salon) => {
            const { data: slots, error: slotsError } = await supabase
              .from('reservations')
              .select('date, time')
              .eq('salon_id', salon.id)
              .gte('date', new Date().toISOString().split('T')[0])
              .order('date', { ascending: true })
              .order('time', { ascending: true })
              .limit(1);

            if (slotsError) {
              console.error('Error fetching slots:', slotsError);
              return salon;
            }

            if (!salon.latitude || !salon.longitude) {
              try {
                const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(salon.adresse + ' ' + salon.code_postal)}&key=${GOOGLE_MAPS_API_KEY}`);
                const data = await response.json();
                if (data.results && data.results.length > 0) {
                  salon.latitude = data.results[0].geometry.location.lat;
                  salon.longitude = data.results[0].geometry.location.lng;
                }
              } catch (error) {
                console.error('Error geocoding address:', error);
              }
            }

            return {
              ...salon,
              nextAvailableSlot: slots && slots[0] ? `${slots[0].date} ${slots[0].time}` : undefined
            };
          })
        );

        const postalCodes = codePostal ? codePostal.split(',') : [];
        const filteredSalons = salonsWithSlots.filter(salon => postalCodes.includes(salon.code_postal));
        setSalons(filteredSalons);
      } catch (error) {
        console.error('Erreur lors de la récupération des salons :', error);
        setError('Une erreur est survenue lors de la récupération des salons. Veuillez réessayer plus tard.');
      }
    };

    if (codePostal) {
      fetchSalons();
    }
  }, [codePostal]);

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

  const filteredSalons = salons.filter(salon =>
    salon.nom_salon.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (map && hoveredSalon) {
      map.panTo({ lat: hoveredSalon.latitude!, lng: hoveredSalon.longitude! });
      map.setZoom(14);
    }
  }, [hoveredSalon, map]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      {/* Left side - Salon List */}
      <div className="p-6 overflow-auto max-h-screen">
        <h1 className="text-4xl font-serif text-[#4A332F] mb-6">Liste des Salons</h1>
        
        {error ? (
          <div className="text-red-500 mb-4">{error}</div>
        ) : (
          <>
            <div className="mb-8 relative">
              <Input
                type="text"
                placeholder="Rechercher un salon..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full p-4 text-lg border border-gray-300 rounded-lg shadow-sm"
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

            <div className="space-y-4">
              {filteredSalons.map((salon) => (
                <Card 
                  key={salon.id} 
                  className="p-4 hover:shadow-lg transition-shadow"
                  onMouseEnter={() => setHoveredSalon(salon)}
                  onMouseLeave={() => setHoveredSalon(null)}
                >
                  <div className="flex gap-4">
                    <div className="relative h-40 w-72 flex-shrink-0">
                      <Image
                        src={salon.image_url || "/placeholder.svg"}
                        alt={salon.nom_salon}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold">{salon.nom_salon}</h3>
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full shadow-sm">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{salon.note || "N/A"}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-gray-600 mt-2">
                        <MapPin className="h-5 w-5 shrink-0 mt-0.5" />
                        <span className="text-sm">{salon.adresse}, {salon.code_postal}</span>
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-4">
                        <div className="text-sm text-gray-600">
                          <CalendarIcon className="h-4 w-4 inline-block mr-2" />
                          <span>
                            {salon.nextAvailableSlot 
                              ? `Prochaine dispo: ${format(new Date(salon.nextAvailableSlot), 'dd/MM/yyyy HH:mm')}`
                              : 'Aucun créneau disponible'}
                          </span>
                        </div>
                        <Button
                          className="bg-[#8B4513] hover:bg-[#6F3710] text-white px-4 py-2 text-sm"
                          onClick={() => handleRedirect(salon.id)}
                        >
                          Prendre RDV
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Right side - Interactive Map */}
      <div className="h-screen">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={11}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              mapTypeControl: false,
              streetViewControl: false
            }}
          >
            {salons.map((salon) => (
              salon.latitude && salon.longitude ? (
                <Marker
                  key={salon.id}
                  position={{ lat: salon.latitude, lng: salon.longitude }}
                  onClick={() => setSelectedSalon(salon)}
                  animation={hoveredSalon && hoveredSalon.id === salon.id ? google.maps.Animation.BOUNCE : undefined}
                />
              ) : null
            ))}
            {selectedSalon && (
              <InfoWindow
                position={{ lat: selectedSalon.latitude!, lng: selectedSalon.longitude! }}
                onCloseClick={() => setSelectedSalon(null)}
              >
                <div>
                  <h3>{selectedSalon.nom_salon}</h3>
                  <p>{selectedSalon.adresse}, {selectedSalon.code_postal}</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        ) : <div>Loading...</div>}
      </div>
    </div>
  );
}
