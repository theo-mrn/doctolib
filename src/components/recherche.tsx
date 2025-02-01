"use client"
import { useState, useEffect, useRef } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from 'next/navigation';

type CitySuggestion = {
  nom: string;
  codesPostaux: string[];
};

const INITIAL_SUGGESTIONS = [
  "Coiffeur","Barbier", "Manucure", "Esthéticienne","Salon de beauté",
  "Pédicure", "Coloration",
  "Extensions","Massage crânien", 
  "Epilation", "Maquillage", "Soins du visage", "Soins du corps", "Spa", 
  "Tatouage", "Piercing", "Soins des pieds", "Soins des mains", "Onglerie", 
  "Beauté des pieds","Relooking"
];

export default function SalonRecherche() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([])
  const [serviceQuery, setServiceQuery] = useState("")
  const [serviceSuggestions, setServiceSuggestions] = useState(INITIAL_SUGGESTIONS)
  const [selectedCity, setSelectedCity] = useState<{ nom: string; codesPostaux: string[] } | null>(null)
  const [isServiceModified, setIsServiceModified] = useState(false)
  const [activeField, setActiveField] = useState<'service' | 'city' | null>(null);
  const componentRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  useEffect(() => {
    const typeParam = searchParams.get('type')
    if (typeParam) {
      // Capitaliser la première lettre
      const formattedType = typeParam.charAt(0).toUpperCase() + typeParam.slice(1)
      setServiceQuery(formattedType)
      setServiceSuggestions(INITIAL_SUGGESTIONS)
      setIsServiceModified(false)
    }
  }, [searchParams])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
        setActiveField(null);
        setSuggestions([]);
        setServiceSuggestions(INITIAL_SUGGESTIONS);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (input: string) => {
    if (input.length < 2) return // Limiter les appels pour les entrées courtes

    const response = await fetch(
      `https://geo.api.gouv.fr/communes?nom=${input}&fields=nom,codesPostaux&boost=population&limit=5`
    )
    const data = await response.json()
    setSuggestions(data)
  }

  const handleCitySelect = (city: { nom: string; codesPostaux: string[] }) => {
    setQuery(city.nom)
    setSuggestions([]) 
    setSelectedCity(city)
  }

  const handleSearch = () => {
    if (selectedCity && selectedCity.codesPostaux.length > 0) {
      const postalCodeParams = selectedCity.codesPostaux.join(',');
      router.push(`/dashboard?codePostal=${encodeURIComponent(postalCodeParams)}&service=${encodeURIComponent(serviceQuery)}`);
    } else {
      alert("Veuillez sélectionner une ville avec un code postal valide.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 rounded-lg shadow-lg" ref={componentRef}>
      <div className="flex-1 relative">
        <Input
          type="text"
          placeholder="Que cherchez-vous ?"
          className="w-full h-10"
          value={serviceQuery}
          onChange={(e) => {
            setServiceQuery(e.target.value)
            setIsServiceModified(true)
            setActiveField('service')
          }}
          onFocus={() => setActiveField('service')}
        />
        {serviceQuery.length > 0 && serviceSuggestions.length > 0 && 
         (isServiceModified || !searchParams.get('type')) && 
         activeField === 'service' && (
          <ul className="absolute bg-white border border-gray-200 rounded-lg shadow-lg mt-2 w-full z-50">
            {serviceSuggestions
              .filter((service) =>
                service.toLowerCase().includes(serviceQuery.toLowerCase())
              )
              .map((service) => (
                <li
                  key={service}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setServiceQuery(service)
                    setServiceSuggestions([]) 
                  }}
                >
                  {service}
                </li>
              ))}
          </ul>
        )}
      </div>
      <div className="flex-1 relative">
        <Input
          type="text"
          placeholder="Où ? Adresse, ville..."
          className="w-full h-10 "
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            fetchSuggestions(e.target.value)
            setActiveField('city')
          }}
          onFocus={() => setActiveField('city')}
        />
        {suggestions.length > 0 && activeField === 'city' && (
          <ul className="absolute bg-white border border-gray-200 rounded-lg shadow-lg mt-2 w-full z-50">
            {suggestions.map((city, index) => (
              <li
                key={`${city.nom}-${index}`}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleCitySelect(city)}
              >
                {city.nom}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Button 
        className="mt-4 md:mt-0" 
        onClick={() => {
          handleSearch();
          setActiveField(null);
        }}
      >
        <Search className="mr-2 h-4 w-4" /> Rechercher
      </Button>
    </div>
  )
}
