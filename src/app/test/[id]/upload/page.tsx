import UploadSalonImages from "@/components/addImages";

const UploadPage = ({ params }: { params: { id: string } }) => {
  const salonId = parseInt(params.id, 10);

  return (
    <div>
      <UploadSalonImages salonId={salonId} />
    </div>
  );
};

export default UploadPage;