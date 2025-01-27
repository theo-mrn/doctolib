// components/UploadPrestationImages.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type UploadPrestationImagesProps = {
  salonId: number;
};

const UploadPrestationImages: React.FC<UploadPrestationImagesProps> = ({ salonId }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const filePath = `prestations/${salonId}/${Date.now()}_${file.name}`;

      // Upload de l'image
      const { error } = await supabase.storage
        .from("prestations")
        .upload(filePath, file);

      if (error) throw error;

      // Récupération de l'URL publique
      const publicUrl = supabase.storage
        .from("prestations")
        .getPublicUrl(filePath).data.publicUrl;

      if (!publicUrl) {
        throw new Error("Erreur lors de la récupération de l'URL publique de l'image");
      }

      // Insertion dans la base de données
      const { error: insertError } = await supabase
        .from("prestation_images")
        .insert({ salon_id: salonId, image_url: publicUrl });

      if (insertError) throw insertError;

      alert("Image de prestation téléchargée avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'upload de l'image :", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Ajouter des images de prestation</h2>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        className="block w-full border rounded p-2"
      />
      {uploading && <p className="text-gray-500 mt-2">Chargement...</p>}
    </div>
  );
};

export default UploadPrestationImages;