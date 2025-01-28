import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SalonFormData } from "../SalonRegistrationForm"

interface DescriptionImageProps {
  step: 'description-image';
  formData: SalonFormData;
  setFormData: React.Dispatch<React.SetStateAction<SalonFormData>>;
}

export default function DescriptionImage({ formData, setFormData }: Omit<DescriptionImageProps, 'step'>) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" value={formData.description || ""} onChange={handleChange} />
      </div>
    </div>
  )
}

