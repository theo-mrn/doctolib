"use client"

import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Star, Search, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Image from "next/image"
import { format, startOfWeek, addDays, isToday } from "date-fns"
import { fr } from "date-fns/locale"
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api"
import GallerySalonImages from "@/components/SalonImages";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import ImageCarousel from "@/components/ImageCarousel";

const GOOGLE_MAPS_API_KEY = "AIzaSyBXn4swG2df3ijBKYswj29sq4mQt_HoZyQ"

type Salon = {
  id: number
  nom_salon: string
  adresse: string
  code_postal: string
  image_url?: string
  note?: number
  latitude?: number
  longitude?: number
  types: string[]
}

type SalonWithNextSlot = Salon & {
  slots?: { [key: string]: string[] }
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
}

const center = {
  lat: 48.8566,
  lng: 2.3522,
}

export default function SalonList() {
  const [salons, setSalons] = useState<SalonWithNextSlot[]>([])
  const [filteredSalons, setFilteredSalons] = useState<SalonWithNextSlot[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [suggestions, setSuggestions] = useState<Salon[]>([])
  const [error, setError] = useState<string | null>(null)
  const [hoveredSalon, setHoveredSalon] = useState<SalonWithNextSlot | null>(null)
  const [selectedSalon, setSelectedSalon] = useState<SalonWithNextSlot | null>(null)
  const [codePostal, setCodePostal] = useState<string | null>(null)
  const [weekDates, setWeekDates] = useState<Date[]>([])
  const [expandedSalons, setExpandedSalons] = useState<{ [key: number]: boolean }>({})
  const [service, setService] = useState<string | null>(null)
  const [sortOption, setSortOption] = useState<string>("note")
  const [minRating, setMinRating] = useState<number>(0)
  const [availableOnly, setAvailableOnly] = useState<boolean>(false)
  const [selectedSalonImages, setSelectedSalonImages] = useState<number | null>(null);
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  useEffect(() => {
    const query = new URLSearchParams(window.location.search)
    const codePostalParam = query.get("codePostal")
    const serviceParam = query.get("service")
    setCodePostal(codePostalParam)
    setService(serviceParam)
  }, [])

  useEffect(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 })
    const dates = Array.from({ length: 7 }, (_, i) => addDays(start, i))
    setWeekDates(dates)
  }, [])

  useEffect(() => {
    const fetchSalonSlots = async (salon: Salon) => {
      const slots: { [key: string]: string[] } = {}

      for (const date of weekDates) {
        const formattedDate = date.toISOString().split("T")[0]
        const { data, error } = await supabase
          .from("reservations")
          .select("time")
          .eq("salon_id", salon.id)
          .eq("date", formattedDate)

        if (error) {
          console.error("Error fetching slots:", error)
          continue
        }

        slots[formattedDate] = data.map((res: { time: string }) => res.time.slice(0, 5))
      }

      return slots
    }

    const fetchSalonsWithSlots = async () => {
      try {
        const { data, error } = await supabase.from("salons").select("*")
        if (error) throw new Error(error.message)

        if (!data) {
          setError("No salon data available.")
          return
        }

        const salonsWithSlots = await Promise.all(
          data
            .filter((salon) => {
              if (service && (!salon.types || !salon.types.includes(service))) {
                return false
              }
              return true
            })
            .map(async (salon) => {
              if (!salon.latitude || !salon.longitude) {
                try {
                  const response = await fetch(
                    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(salon.adresse + " " + salon.code_postal)}&key=${GOOGLE_MAPS_API_KEY}`,
                  )
                  const data = await response.json()
                  if (data.results && data.results.length > 0) {
                    salon.latitude = data.results[0].geometry.location.lat
                    salon.longitude = data.results[0].geometry.location.lng
                  }
                } catch (error) {
                  console.error("Error geocoding address:", error)
                }
              }

              const availableSlots = await fetchSalonSlots(salon)
              return {
                ...salon,
                slots: availableSlots,
              }
            }),
        )

        const postalCodes = codePostal ? codePostal.split(",") : []
        const filteredSalons = salonsWithSlots.filter((salon) => postalCodes.includes(salon.code_postal))
        setSalons(filteredSalons)
        setFilteredSalons(filteredSalons)
      } catch (error) {
        console.error("Erreur lors de la récupération des salons :", error)
        setError("Une erreur est survenue lors de la récupération des salons. Veuillez réessayer plus tard.")
      }
    }

    if (codePostal) {
      fetchSalonsWithSlots()
    }
  }, [codePostal, service, weekDates])

  const handleRedirect = (id: number) => {
    const currentPath = window.location.pathname
    router.push(`${currentPath}/${id}`)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)

    if (value.length > 0) {
      const filtered = salons.filter((salon) => salon.nom_salon.toLowerCase().includes(value.toLowerCase()))
      setSuggestions(filtered)
    } else {
      setSuggestions([])
    }
  }

  const handleSuggestionClick = (salon: Salon) => {
    setSearchTerm(salon.nom_salon)
    setSuggestions([])
    inputRef.current?.focus()
  }

  useEffect(() => {
    if (map && hoveredSalon) {
      map.panTo({ lat: hoveredSalon.latitude!, lng: hoveredSalon.longitude! })
      map.setZoom(14)
    }
  }, [hoveredSalon, map])

  const timeSlots = useMemo(() => [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
  ], [])

  const toggleExpand = (salonId: number) => {
    setExpandedSalons((prev) => ({
      ...prev,
      [salonId]: !prev[salonId],
    }))
  }

  const renderTimeSlots = (availableSlots: string[]) => {
    const midIndex = Math.ceil(availableSlots.length / 2)
    const firstRow = availableSlots.slice(0, midIndex)
    const secondRow = availableSlots.slice(midIndex)

    return (
      <div className="grid grid-cols-1 gap-1">
        <div className="flex flex-wrap gap-1">
          {firstRow.map((slot) => (
            <Button
              key={slot}
              variant="outline"
              className="text-xs py-1 px-2 bg-[#8B4513] text-white hover:bg-[#6F3710]"
            >
              {slot}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {secondRow.map((slot) => (
            <Button
              key={slot}
              variant="outline"
              className="text-xs py-1 px-2 bg-[#8B4513] text-white hover:bg-[#6F3710]"
            >
              {slot}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  const applyFiltersAndSort = useCallback(() => {
    let filtered = [...salons]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((salon) => salon.nom_salon.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Apply rating filter
    filtered = filtered.filter((salon) => (salon.note || 0) >= minRating)

    // Apply availability filter
    if (availableOnly) {
      filtered = filtered.filter((salon) => {
        const todayDate = new Date().toISOString().split("T")[0]
        const todaySlots = salon.slots?.[todayDate] || []
        return timeSlots.some((slot) => !todaySlots.includes(slot))
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOption) {
        case "note":
          return (b.note || 0) - (a.note || 0)
        case "nom":
          return a.nom_salon.localeCompare(b.nom_salon)
        default:
          return 0
      }
    })

    setFilteredSalons(filtered)
  }, [salons, searchTerm, minRating, availableOnly, sortOption, timeSlots])

  useEffect(() => {
    applyFiltersAndSort()
  }, [applyFiltersAndSort])

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
      {/* Left side - Salon List */}
      <div className="lg:w-1/2 p-4 overflow-auto max-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-serif text-[#4A332F]">Liste des Salons</h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filtres et Tri</SheetTitle>
                <SheetDescription>Affinez votre recherche de salons</SheetDescription>
              </SheetHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sort">Trier par</Label>
                  <Select onValueChange={(value) => setSortOption(value)}>
                    <SelectTrigger id="sort">
                      <SelectValue placeholder="Choisir un tri" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="note">Note</SelectItem>
                      <SelectItem value="nom">Nom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rating">Note minimum</Label>
                  <Slider
                    id="rating"
                    min={0}
                    max={5}
                    step={0.5}
                    value={[minRating]}
                    onValueChange={(value) => setMinRating(value[0])}
                  />
                  <div className="text-right">{minRating}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="available" checked={availableOnly} onCheckedChange={setAvailableOnly} />
                  <Label htmlFor="available">Disponible aujourd&apos;hui uniquement</Label>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {error ? (
          <div className="text-red-500 mb-4">{error}</div>
        ) : (
          <>
            <div className="mb-4 relative">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Rechercher un salon..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full p-3 pl-10 text-base border border-gray-300 rounded-lg shadow-sm"
                  ref={inputRef}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              {suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-md mt-1 max-h-60 overflow-y-auto">
                  {suggestions.map((salon) => (
                    <li
                      key={salon.id}
                      className="p-2 cursor-pointer hover:bg-gray-100 text-sm"
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
                  className="hover:shadow-lg transition-shadow overflow-hidden"
                  onMouseEnter={() => setHoveredSalon(salon)}
                  onMouseLeave={() => setHoveredSalon(null)}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative h-80 sm:h-80 sm:w-1/3">
                        <ImageCarousel salonId={salon.id} />
                      </div>
                      <div className="flex-1 p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-[#4A332F]">{salon.nom_salon}</h3>
                          <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs font-medium text-yellow-700">{salon.note || "N/A"}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-1 text-gray-600 mb-2 text-xs">
                          <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[#8B4513]" />
                          <span>
                            {salon.adresse}, {salon.code_postal}
                          </span>
                        </div>
                        <div className="mb-2">
                          <h4 className="text-xs font-semibold text-gray-700 mb-1">
                            {expandedSalons[salon.id]
                              ? "Créneaux disponibles cette semaine"
                              : "Créneaux disponibles aujourd'hui"}
                          </h4>
                          <div className="space-y-2">
                            {weekDates
                              .filter((date) => expandedSalons[salon.id] || isToday(date))
                              .map((date) => {
                                const formattedDate = date.toISOString().split("T")[0]
                                const reservedSlots = salon.slots?.[formattedDate] || []
                                const availableSlots = timeSlots.filter((slot) => !reservedSlots.includes(slot))

                                return (
                                  <div key={formattedDate} className="border-b pb-2 last:border-b-0">
                                    <div className="text-xs font-medium text-gray-700 mb-1">
                                      {isToday(date) ? "Aujourd'hui" : format(date, "EEEE d MMMM", { locale: fr })}
                                    </div>
                                    {availableSlots.length > 0 ? (
                                      renderTimeSlots(availableSlots)
                                    ) : (
                                      <span className="text-xs text-gray-500">Aucun créneau disponible</span>
                                    )}
                                  </div>
                                )
                              })}
                          </div>
                          <Button
                            variant="link"
                            onClick={() => toggleExpand(salon.id)}
                            className="mt-2 text-[#8B4513] text-xs p-0 h-auto"
                          >
                            {expandedSalons[salon.id] ? (
                              <>
                                <ChevronUp className="w-3 h-3 mr-1" />
                                Voir moins
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3 mr-1" />
                                Voir tous les créneaux
                              </>
                            )}
                          </Button>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            className="bg-[#8B4513] hover:bg-[#6F3710] text-white px-4 py-1 text-xs"
                            onClick={() => handleRedirect(salon.id)}
                          >
                            Prendre RDV
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Right side - Interactive Map */}
      <div className="lg:w-1/2 h-[400px] lg:h-screen sticky top-0">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={11}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              mapTypeControl: false,
              streetViewControl: false,
            }}
          >
            {filteredSalons.map((salon) =>
              salon.latitude && salon.longitude ? (
                <Marker
                  key={salon.id}
                  position={{ lat: salon.latitude, lng: salon.longitude }}
                  onClick={() => setSelectedSalon(salon)}
                  animation={hoveredSalon && hoveredSalon.id === salon.id ? google.maps.Animation.BOUNCE : undefined}
                />
              ) : null,
            )}
            {selectedSalon && (
              <InfoWindow
                position={{ lat: selectedSalon.latitude!, lng: selectedSalon.longitude! }}
                onCloseClick={() => setSelectedSalon(null)}
              >
                <div>
                  <h3 className="font-semibold">{selectedSalon.nom_salon}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedSalon.adresse}, {selectedSalon.code_postal}
                  </p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-200">Chargement de la carte...</div>
        )}
      </div>

      {selectedSalonImages && (
        <Dialog open={!!selectedSalonImages} onOpenChange={() => setSelectedSalonImages(null)}>
          <DialogContent className="w-full h-full max-w-none max-h-none">
            <DialogTitle className="sr-only">Galerie d'images</DialogTitle>
            <GallerySalonImages salonId={selectedSalonImages} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

