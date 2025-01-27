"use client";

import UploadSalonImages from "@/components/addprestationimages";
import { useParams } from 'next/navigation';

const UploadPage = () => {
  const { id } = useParams();
  const salonId = id ? parseInt(id as string, 10) : null;

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