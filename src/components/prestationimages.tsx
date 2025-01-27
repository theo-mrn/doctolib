// components/GalleryPrestationImages.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type GalleryPrestationImagesProps = {
  salonId: number;
};

type GalleryImage = {
  id: number;
  image_url: string;
};

const GalleryPrestationImages: React.FC<GalleryPrestationImagesProps> = ({ salonId }) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [showAllImages, setShowAllImages] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase
        .from("prestation_images")
        .select("id, image_url")
        .eq("salon_id", salonId);

      if (error) {
        console.error("Erreur lors de la récupération des images :", error);
      } else {
        setImages(data || []);
      }
    };

    fetchImages();
  }, [salonId]);

  return (
    <div className="w-full max-w-5xl mx-auto right-0 p-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.slice(0, 5).map((image) => (
          <div key={image.id} className="relative aspect-[16/9]">
            <Image
              src={image.image_url}
              alt="Image de prestation"
              fill
              className="rounded-md object-cover"
            />
          </div>
        ))}
        {images.length > 5 && (
          <div className="relative aspect-[16/9] flex items-center justify-center bg-gray-200 rounded-md cursor-pointer hover:opacity-95 transition-opacity" onClick={() => setShowAllImages(true)}>
            <Image
              src={images[5].image_url}
              alt="Voir toutes les images"
              fill
              className="rounded-md object-cover filter blur-sm"
            />
            <span className="absolute text-lg font-semibold text-white">Voir toutes les images</span>
          </div>
        )}
      </div>

      <Dialog open={showAllImages} onOpenChange={() => setShowAllImages(false)}>
        <DialogContent className="w-full h-full max-w-none max-h-none overflow-y-auto">
          <DialogTitle className="sr-only">Galerie d&apos;images de prestation</DialogTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            {images.map((image, index) => (
              <div key={image.id} className="relative aspect-[16/9]">
                <Image
                  src={image.image_url}
                  alt={`Prestation Image ${index + 1}`}
                  fill
                  className="rounded-md object-cover"
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GalleryPrestationImages;