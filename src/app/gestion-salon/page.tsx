'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import SalonInfo from '@/components/SalonInfo';

export default function GestionSalon() {
  const [salons, setSalons] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchSalons = async () => {
      if (userId) {
        const { data, error } = await supabase
          .from('salons')
          .select('*')
          .eq('professionnel_id', userId);

        if (error) {
          console.error('Erreur lors de la récupération des salons :', error.message);
        } else {
          setSalons(data);
        }
      }
    };

    fetchSalons();
  }, [userId]);

  return (
    <div className="container mx-auto px-4 py-8">
      {salons.length > 0 ? (
        salons.map((salon) => (
          <SalonInfo key={salon.id} salon={salon} />
        ))
      ) : (
        <p>Aucun salon trouvé.</p>
      )}
    </div>
  );
}
