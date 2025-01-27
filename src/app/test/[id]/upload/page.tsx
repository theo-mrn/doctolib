"use client";

import UploadSalonImages from "@/components/addImages";
import { useSearchParams } from 'next/navigation';

const UploadPage = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const salonId = parseInt(id as string, 10);

  return (
    <div>
      <UploadSalonImages salonId={salonId} />
    </div>
  );
};

export default UploadPage;