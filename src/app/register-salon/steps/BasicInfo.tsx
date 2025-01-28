import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SalonFormData } from "../SalonRegistrationForm"

interface BasicInfoProps {
  formData: SalonFormData;
  setFormData: React.Dispatch<React.SetStateAction<SalonFormData>>;
}

export default function BasicInfo({ formData, setFormData }: BasicInfoProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="nom_salon">Nom du salon</Label>
        <Input 
          id="nom_salon" 
          name="nom_salon" 
          value={formData.nom_salon || ""} 
          onChange={handleChange} 
          required 
        />
      </div>
    </div>
  )
}
