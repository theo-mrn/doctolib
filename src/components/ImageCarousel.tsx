"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, ArrowRight } from 'lucide-react';

type ImageCarouselProps = {
  salonId: number;
};

type CarouselImage = {
  id: number;
  image_url: string;
};

const ImageCarousel: React.FC<ImageCarouselProps> = ({ salonId }) => {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

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
    setCurrentIndex((currentIndex + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentIndex((currentIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {images.length > 0 && (
        <div className="relative aspect-[16/9] w-full h-64 sm:h-80 group">
          <Image
            src={images[currentIndex].image_url}
            alt={`Salon Image ${currentIndex + 1}`}
            fill
            className="rounded-lg object-cover"
          />
          <button
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handlePrevImage}
          >
            <ArrowLeft/>
          </button>
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleNextImage}
          >
                <ArrowRight/>
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
