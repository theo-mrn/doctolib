// components/GallerySalonImages.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight} from 'lucide-react';


type GallerySalonImagesProps = {
  salonId: number;
};

type GalleryImage = {
  id: number;
  image_url: string;
};

const GallerySalonImages: React.FC<GallerySalonImagesProps> = ({ salonId }) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [showAllImages, setShowAllImages] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase
        .from("salon_images")
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

  const handleNextImage = () => {
    if (currentIndex !== null) {
      setCurrentIndex((currentIndex + 1) % images.length);
      setSelectedImage(images[(currentIndex + 1) % images.length]);
    }
  };

  const handlePrevImage = () => {
    if (currentIndex !== null) {
      setCurrentIndex((currentIndex - 1 + images.length) % images.length);
      setSelectedImage(images[(currentIndex - 1 + images.length) % images.length]);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.slice(0, 5).map((image, index) => (
          <div key={image.id} className={`relative ${index === 0 ? "col-span-2 row-span-2" : ""}`}>
            <div className="relative aspect-[16/9]">
              <Image
                src={image.image_url}
                alt={`Salon Image ${index + 1}`}
                fill
                className="rounded-md object-cover cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => {
                  setSelectedImage(image);
                  setCurrentIndex(index);
                }}
              />
            </div>
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

      <Dialog open={!!selectedImage || showAllImages} onOpenChange={() => { setSelectedImage(null); setShowAllImages(false); }}>
        <DialogContent className="w-full h-full max-w-none max-h-none">
          <DialogTitle className="sr-only">Galerie d&apos;images</DialogTitle>
          {selectedImage && !showAllImages && (
            <>
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={selectedImage.image_url}
                  alt="Image sélectionnée"
                  fill
                  className="rounded-lg object-contain"
                />
                <button
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-opacity-50 p-2 rounded-full"
                  onClick={handlePrevImage}
                >
                  <ArrowLeft/>
                </button>
                <button
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-opacity-50 p-2 rounded-full"
                  onClick={handleNextImage}
                >
                   <ArrowRight/>
                </button>
              </div>
            </>
          )}
          {showAllImages && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
              {images.map((image, index) => (
                <div key={image.id} className="relative aspect-[16/9]">
                  <Image
                    src={image.image_url}
                    alt={`Salon Image ${index + 1}`}
                    fill
                    className="rounded-md object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GallerySalonImages;