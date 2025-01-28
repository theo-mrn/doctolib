import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SalonFormData } from "../SalonRegistrationForm"

interface AddressProps {
  formData: SalonFormData;
  setFormData: React.Dispatch<React.SetStateAction<SalonFormData>>;
}

export default function Address({ formData, setFormData }: AddressProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="adresse">Adresse</Label>
        <Input id="adresse" name="adresse" value={formData.adresse || ""} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="code_postal">Code postal</Label>
        <Input
          id="code_postal"
          name="code_postal"
          value={formData.code_postal || ""}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="ville">Ville</Label>
        <Input id="ville" name="ville" value={formData.ville || ""} onChange={handleChange} required />
      </div>
    </div>
  )
}

