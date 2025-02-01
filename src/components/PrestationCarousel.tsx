"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface PrestationCarouselProps {
  salonId: string | number;
}

type CarouselImage = {
  id: number;
  image_url: string;
};

const PrestationCarousel: React.FC<PrestationCarouselProps> = ({ salonId }) => {
  const numericSalonId = typeof salonId === 'string' ? parseInt(salonId, 10) : salonId;
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase
        .from("prestation_images")
        .select("id, image_url")
        .eq("salon_id", numericSalonId);

      if (error) {
        console.error("Erreur lors de la récupération des images :", error);
      } else {
        setImages(data || []);
      }
    };

    fetchImages();
  }, [numericSalonId]);

  const handleNextImage = () => {
    setCurrentIndex((currentIndex + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentIndex((currentIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="relative w-full max-w-full sm:max-w-3xl mx-auto">
      {images.length > 0 && (
        <div className="relative aspect-[16/9] w-full h-48 sm:h-64 group">
          <Image
            src={images[currentIndex].image_url}
            alt={`Prestation Image ${currentIndex + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="rounded-lg object-cover"
          />
          <button
            className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 sm:p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handlePrevImage}
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5"/>
          </button>
          <button
            className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 sm:p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleNextImage}
          >
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5"/>
          </button>
        </div>
      )}
    </div>
  );
};

export default PrestationCarousel;
