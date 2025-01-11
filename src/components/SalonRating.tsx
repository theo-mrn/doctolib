import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

type SalonRatingProps = {
  salonId: number;
  initialRating: number;
  initialVotes: number;
};

export default function SalonRating({ salonId, initialRating, initialVotes }: SalonRatingProps) {
  const [rating, setRating] = useState(initialRating);
  const [votes, setVotes] = useState(initialVotes);
  const [userRating, setUserRating] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('❌ Erreur lors de la récupération de l\'utilisateur:', authError?.message);
        return;
      }
      console.log('Utilisateur connecté:', user.id); 
      setUserId(user.id);

      const { data: existingRating, error: fetchError } = await supabase
        .from('ratings')
        .select('note')
        .eq('client_id', user.id)
        .eq('salon_id', salonId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Erreur lors de la récupération de la note de l\'utilisateur :', fetchError.message);
      } else if (existingRating) {
        setUserRating(existingRating.note);
      }
    };

    fetchUserProfile();
  }, [salonId]);

  const handleRating = async (newRating: number) => {
    if (!userId) {
      console.error('Utilisateur non authentifié');
      return;
    }

    const { data: existingRating, error: fetchError } = await supabase
      .from('ratings')
      .select('*')
      .eq('client_id', userId)
      .eq('salon_id', salonId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Erreur lors de la vérification de la note existante :', fetchError.message);
      return;
    }

    if (existingRating) {
      const { error: updateError } = await supabase
        .from('ratings')
        .update({ note: newRating })
        .eq('id', existingRating.id);

      if (updateError) {
        console.error('Erreur lors de la mise à jour de la note :', updateError.message);
        return;
      }

      const newRatingTotal = rating * votes - existingRating.note + newRating;
      const newAverageRating = newRatingTotal / votes;

      const { error: salonUpdateError } = await supabase
        .from('salons')
        .update({ note: newAverageRating })
        .eq('id', salonId);

      if (salonUpdateError) {
        console.error('Erreur lors de la mise à jour de la note du salon :', salonUpdateError.message);
      } else {
        setRating(newAverageRating);
        setUserRating(newRating);
      }
      return;
    }

    const newVotes = votes + 1;
    const newRatingTotal = rating * votes + newRating;
    const newAverageRating = newRatingTotal / newVotes;

    const { error } = await supabase
      .from('salons')
      .update({ note: newAverageRating, nombre_votes: newVotes })
      .eq('id', salonId);

    if (error) {
      console.error('Erreur lors de la mise à jour de la note :', error.message);
    } else {
      const newRatingId = uuidv4();
      console.log('Valeurs avant insertion:', {
        id: newRatingId,
        client_id: userId,
        salon_id: salonId,
        note: newRating,
      });

      const { error: insertError } = await supabase
        .from('ratings')
        .insert({
          id: newRatingId, 
          client_id: userId,
          salon_id: salonId,
          note: newRating,
        });

      if (insertError) {
        console.error('Erreur lors de l\'ajout de la note :', insertError.message);
      } else {
        setRating(newAverageRating);
        setVotes(newVotes);
        setUserRating(newRating);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full space-y-4">
      <h2 className="text-xl font-serif text-[#4A332F] mb-3">Note de l&apos;établissement</h2>
      <p className="text-gray-600">Note moyenne : {rating.toFixed(1)} ({votes} votes)</p>
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRating(star)}
            className={`text-2xl ${userRating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}
