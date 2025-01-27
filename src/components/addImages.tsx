// components/UploadSalonImages.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type UploadSalonImagesProps = {
  salonId: number;
};

const UploadSalonImages: React.FC<UploadSalonImagesProps> = ({ salonId }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const filePath = `${salonId}/${Date.now()}_${file.name}`;

      const { data, error } = await supabase.storage
        .from("image_salons")
        .upload(filePath, file);

      if (error) throw error;

      const publicUrl = supabase.storage
        .from("image_salons")
        .getPublicUrl(filePath).data.publicUrl;

      const { error: insertError } = await supabase
        .from("salon_images")
        .insert({ salon_id: salonId, image_url: publicUrl });

      if (insertError) throw insertError;

      alert("Image téléchargée avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'upload de l'image :", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Ajouter des images au salon</h2>
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

export default UploadSalonImages;