'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card'; 
import { Separator } from '@/components/ui/separator';
import { Info, Edit3, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';

type Props = {
  salon: {
    id: string;
    nom_salon: string;
    adresse: string;
    description: string;
    code_postal: string;
    ville: string;
    image_url?: string;
  };
};

export default function SalonInfo({ salon }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSalon, setEditedSalon] = useState(salon);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    setEditedSalon(salon);
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