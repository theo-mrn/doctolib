"use client";

import UploadSalonImages from "@/components/addImages";
import { useParams } from 'next/navigation';

const UploadPage = () => {
  const { id } = useParams();
  const salonId = id ? (Array.isArray(id) ? parseInt(id[0], 10) : parseInt(id, 10)) : null;

  if (salonId === null || isNaN(salonId)) {
    return <div>Erreur : ID du salon non valide</div>;
  }

  return (
    <div>
      <UploadSalonImages salonId={salonId} />
    </div>
  );
};

export default UploadPage;