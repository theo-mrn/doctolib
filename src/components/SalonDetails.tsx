import SalonRating from './SalonRating';
import { useState } from 'react';
import SalonBookingForm from './SalonBookingForm';
// Suppression de l'import Messagerie

type SalonDetailsProps = {
  salonId: number;
  salonName: string;
  initialRating: number;
  initialVotes: number;
  hours: Record<string, string>;
};

export default function SalonDetails({ salonId, salonName, initialRating, initialVotes, hours }: SalonDetailsProps) {
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);

  return (
    <div className="flex flex-col items-center w-full">
        <div className="rounded-lg shadow-lg w-full space-y-4 mt-6">
        <SalonRating 
        salonId={salonId} 
        initialRating={initialRating} 
        initialVotes={initialVotes} 
      />
      </div>
     
      <div className="bg-white p-6 rounded-lg shadow-lg w-full space-y-4 mt-6">
        <h2 className="text-xl font-serif text-[#4A332F] mb-3">Réservation</h2>
        <p className="text-gray-600">
          Réservez votre rendez-vous en ligne en quelques clics. Choisissez le service souhaité et l&apos;heure qui vous convient.
        </p>
        <button
          onClick={() => setIsBookingFormOpen(true)}
          className="bg-[#8b4513] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#8B4513] w-full"
        >
          Réserver
        </button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-lg w-full space-y-4 mt-6">
        <h2 className="text-xl font-serif text-[#4A332F] mb-3">Horaires</h2>
        <div className="space-y-2">
          {Object.entries(hours).map(([day, hours]) => (
            <div key={day} className="flex justify-between items-center text-gray-600">
              <span className="capitalize">{day}</span>
              <span>{hours}</span>
            </div>
          ))}
        </div>
      </div>

      {isBookingFormOpen && (
        <div className="fixed inset-0 z-30 bg-white p-8 overflow-auto">
          <button
            onClick={() => setIsBookingFormOpen(false)}
            className="absolute top-4 right-4 text-[#8b4513] font-bold"
          >
            Fermer
          </button>
          <SalonBookingForm salon={{ id: salonId.toString(), nom_salon: salonName }} />
        </div>
      )}
    </div>
  );
}
