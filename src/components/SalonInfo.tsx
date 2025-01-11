'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card'; 
import { Separator } from '@/components/ui/separator';
import { MapPin, Info, Edit3, Plus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { TimePicker } from '@/components/ui/TimePicker'; 
import { Checkbox } from '@/components/ui/checkbox';

type HoursType = {
  [key: string]: { start: string; end: string; } | 'Fermé';
};

type Props = {
  salon: {
    id: string;
    nom_salon: string;
    adresse: string;
    description: string;
    code_postal: string;
    ville: string;
    image_url?: string;
    ouverture?: HoursType;
    prestations?: string[]; 
    pricing?: Record<string, number>;
  };
};

export default function SalonInfo({ salon }: Props) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSalon, setEditedSalon] = useState(salon);
  const [editedOuverture, setEditedOuverture] = useState(salon.ouverture || {});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newServiceOption, setNewServiceOption] = useState('');
  const [editedPricing, setEditedPricing] = useState(salon.pricing || {});
  const [newPricingService, setNewPricingService] = useState('');
  const [newPricingPrice, setNewPricingPrice] = useState<number | ''>('');
  const [serviceOptions, setServiceOptions] = useState<string[]>(salon.prestations || []);

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        const fullAddress = `${editedSalon.adresse}, ${editedSalon.code_postal} ${editedSalon.ville}`;
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            fullAddress
          )}&format=json&limit=1`
        );

        const data = await response.json();

        if (data && data[0]) {
          setCoords({
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
          });
        } else {
          console.error('Aucune coordonnée trouvée pour cette adresse.');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des coordonnées :', error);
      }
    };

    fetchCoordinates();
  }, [editedSalon.adresse, editedSalon.code_postal, editedSalon.ville]);

  useEffect(() => {
    setEditedSalon(salon);
    setEditedOuverture(salon.ouverture || {});
    setEditedPricing(salon.pricing || {});
  }, [salon]);

const handleSaveChanges = async () => {
  try {
    let imageUrl = editedSalon.image_url;

    if (imageFile) {
      const { error: uploadError } = await supabase.storage
        .from('image_salons')
        .upload(`public/${salon.id}/${imageFile.name}`, imageFile);

      if (uploadError) {
        console.error('Erreur lors du téléchargement de l\'image :', uploadError.message);
        return;
      }

      const { data: { publicUrl } } = supabase
        .storage
        .from('image_salons')
        .getPublicUrl(`public/${salon.id}/${imageFile.name}`);

      imageUrl = publicUrl;
    }

    const { error } = await supabase
      .from('salons')
      .update({
        nom_salon: editedSalon.nom_salon,
        adresse: editedSalon.adresse,
        description: editedSalon.description,
        code_postal: editedSalon.code_postal,
        ville: editedSalon.ville,
        ouverture: editedOuverture,
        prestations: serviceOptions,
        pricing: editedPricing,
        image_url: imageUrl,
      })
      .eq('id', salon.id);

    if (error) {
      console.error('Erreur lors de la mise à jour :', error.message);
    } else {
      console.log('Salon mis à jour avec succès.');
      setIsEditing(false);
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour :', error);
  }
};

  const handleAddServiceOption = () => {
    if (newServiceOption.trim() !== '') {
      setServiceOptions((prev) => [...prev, newServiceOption.trim()]);
      setNewServiceOption('');
    }
  };

  const handleRemoveServiceOption = (option: string) => {
    setServiceOptions((prev) => prev.filter((opt) => opt !== option));
  };

  const handleHoursChange = (day: string, start: string, end: string) => {
    setEditedOuverture((prev) => ({
      ...prev,
      [day]: { start, end },
    }));
  };

  const toggleDayClosed = (day: string) => {
    setEditedOuverture((prev) => ({
      ...prev,
      [day]: prev[day] === 'Fermé' ? { start: '', end: '' } : 'Fermé',
    }));
  };

  const handleToggleDayOpen = (day: string, isOpen: boolean) => {
    setEditedOuverture((prev) => ({
      ...prev,
      [day]: isOpen ? { start: '', end: '' } : 'Fermé',
    }));
  };

  const handleAddPricing = () => {
    if (newPricingService.trim() !== '' && newPricingPrice !== '') {
      setEditedPricing((prev) => ({
        ...prev,
        [newPricingService.trim()]: newPricingPrice,
      }));
      setNewPricingService('');
      setNewPricingPrice('');
    }
  };

  const daysOfWeek = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

  const mapUrl = coords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.002},${coords.lat - 0.002},${coords.lng + 0.002},${coords.lat + 0.002}&layer=mapnik&marker=${coords.lat},${coords.lng}`
    : null;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {!isEditing ? (
            <>
              {/* Informations générales */}
              <div>
                <h2 className="text-xl font-serif text-[#4A332F] mb-3">À propos</h2>
                <div className="flex items-start text-gray-600">
                  <Info className="h-5 w-5 mr-2 mt-1 flex-shrink-0" />
                  <p>{salon.description}</p>
                </div>
              </div>

              <Separator />

              {/* Adresse */}
              <div>
                <h2 className="text-xl font-serif text-[#4A332F] mb-3">Adresse</h2>
                <div className="flex items-start text-gray-600">
                  <MapPin className="h-5 w-5 mr-2 mt-1 flex-shrink-0" />
                  <p>
                    {salon.adresse}, {salon.code_postal} {salon.ville}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Carte */}
              <div>
                <h2 className="text-xl font-serif text-[#4A332F] mb-3">Carte interactive</h2>
                <div className="h-[300px] rounded-lg overflow-hidden">
                  {mapUrl ? (
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      src={mapUrl}
                      allowFullScreen
                      title="OpenStreetMap View"
                    ></iframe>
                  ) : (
                    <p className="text-gray-500">Chargement de la carte...</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Services */}
              <div>
                <h2 className="text-xl font-serif text-[#4A332F] mb-3">Services</h2>
                <div className="p-2 rounded-lg">
                  {serviceOptions.length > 0 && (
                    <ul className="list-disc list-inside ml-4">
                      {serviceOptions.map((option, index) => (
                        <li key={index}>{option}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <Separator />

              {/* Horaires */}
              <div>
                <h2 className="text-xl font-serif text-[#4A332F] mb-3">Horaires</h2>
                <div className="space-y-2">
                  {Object.entries(salon.ouverture || {}).map(([day, hours]) => (
                    <div key={day} className="flex justify-between items-center text-gray-600">
                      <span className="capitalize">{day}</span>
                      {hours === 'Fermé' ? (
                        <span>Fermé</span>
                      ) : (
                        <span>
                          {hours?.start} - {hours?.end}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Pricing */}
              <div>
                <h2 className="text-xl font-serif text-[#4A332F] mb-3">Tarification</h2>
                <div className="space-y-2">
                  {Object.entries(salon.pricing || {}).map(([service, price]) => (
                    <div key={service} className="flex justify-between items-center text-gray-600">
                      <span>{service}</span>
                      <span>{price} €</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => setIsEditing(true)}
                className="w-full bg-[#8B4513] hover:bg-[#6F3710] text-white mt-6"
              >
                <Edit3 className="w-5 h-5 mr-2" />
                Modifier les informations
              </Button>
            </>
          ) : (
            <>
              {/* Modifier les informations générales */}
              <div>
                <h2 className="text-xl font-serif text-[#4A332F] mb-3">Modifier les informations générales</h2>
                <Input
                  value={editedSalon.nom_salon}
                  onChange={(e) => setEditedSalon({ ...editedSalon, nom_salon: e.target.value })}
                  placeholder="Nom du salon"
                  className="mb-4"
                />
                <Textarea
                  value={editedSalon.description}
                  onChange={(e) => setEditedSalon({ ...editedSalon, description: e.target.value })}
                  placeholder="Description"
                  className="mb-4"
                />
                <Input
                  value={editedSalon.adresse}
                  onChange={(e) => setEditedSalon({ ...editedSalon, adresse: e.target.value })}
                  placeholder="Adresse"
                  className="mb-4"
                />
                <Input
                  value={editedSalon.code_postal}
                  onChange={(e) => setEditedSalon({ ...editedSalon, code_postal: e.target.value })}
                  placeholder="Code postal"
                  className="mb-4"
                />
                <Input
                  value={editedSalon.ville}
                  onChange={(e) => setEditedSalon({ ...editedSalon, ville: e.target.value })}
                  placeholder="Ville"
                  className="mb-4"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="mb-4"
                />
              </div>

              <Separator />

              {/* Modifier les horaires */}
              <h2 className="text-xl font-serif text-[#4A332F] mb-3">Modifier les horaires</h2>
              {daysOfWeek.map((day) => (
                <div key={day} className="flex items-center gap-4 mb-4">
                  <span className="capitalize w-24">{day}</span>
                  <Checkbox
                    checked={editedOuverture[day] !== 'Fermé'}
                    onCheckedChange={(checked: boolean) => handleToggleDayOpen(day, checked)}
                  />
                  {editedOuverture[day] !== 'Fermé' && editedOuverture[day] !== undefined && (
                    <>
                      <TimePicker
                        value={(editedOuverture[day] as { start: string; end: string; }).start || ""}
                        onChange={(time) => handleHoursChange(day, time, (editedOuverture[day] as { start: string; end: string; }).end || "")}
                      />
                      <TimePicker
                        value={(editedOuverture[day] as { start: string; end: string; }).end || ""}
                        onChange={(time) => handleHoursChange(day, (editedOuverture[day] as { start: string; end: string; }).start || "", time)}
                      />
                    </>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => toggleDayClosed(day)}
                    className="text-sm"
                  >
                    {editedOuverture[day] === "Fermé" ? "Ouvrir" : "Fermer"}
                  </Button>
                </div>
              ))}

              <Separator />

              {/* Modifier les services */}
              <div>
                <h2 className="text-xl font-serif text-[#4A332F] mb-3">Modifier les services</h2>
                <div className="space-y-2">
                  {serviceOptions.map((option, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{option}</span>
                      <Trash
                        className="w-4 h-4 text-red-500 cursor-pointer"
                        onClick={() => handleRemoveServiceOption(option)}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-4">
                  <Input
                    value={newServiceOption}
                    onChange={(e) => setNewServiceOption(e.target.value)}
                    placeholder="Nouvelle option"
                  />
                  <Button onClick={handleAddServiceOption} className="bg-[#8B4513] text-white">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Modifier les prix */}
              <div>
                <h2 className="text-xl font-serif text-[#4A332F] mb-3">Modifier les prix</h2>
                <div className="space-y-2">
                  {Object.entries(editedPricing).map(([service, price]) => (
                    <div key={service} className="flex justify-between items-center text-gray-600">
                      <span>{service}</span>
                      <span>{price} €</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-4">
                  <Input
                    value={newPricingService}
                    onChange={(e) => setNewPricingService(e.target.value)}
                    placeholder="Nom de la prestation"
                    className="mb-4"
                  />
                  <Input
                    type="number"
                    value={newPricingPrice}
                    onChange={(e) => setNewPricingPrice(Number(e.target.value))}
                    placeholder="Prix"
                    className="mb-4"
                  />
                  <Button onClick={handleAddPricing} className="bg-[#8B4513] text-white">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleSaveChanges}
                className="w-full bg-green-600 hover:bg-green-800 text-white mt-6"
              >
                Sauvegarder les modifications
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}