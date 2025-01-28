import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PlusCircle, Trash2 } from "lucide-react"
import { SalonFormData, Service, Category } from "../SalonRegistrationForm"

interface PricingProps {
  step: 'pricing'
  formData: SalonFormData
  setFormData: React.Dispatch<React.SetStateAction<SalonFormData>>
}

export default function Pricing({ formData, setFormData }: Omit<PricingProps, 'step'>) {
  const [categories, setCategories] = useState<Category[]>(formData.pricing || [])

  const addCategory = () => {
    const newCategory: Category = {
      id: Date.now().toString(),
      title: "Nouvelle catégorie",
      services: [],
    }
    const updatedCategories = [...categories, newCategory]
    setCategories(updatedCategories)
    setFormData({ ...formData, pricing: updatedCategories })
  }

  const addService = (categoryId: string) => {
    const newService: Service = {
      id: Date.now().toString(),
      title: "Nouveau service",
      duration: "1h",
      price: "0 €",
    }
    const updatedCategories = categories.map((category) =>
      category.id === categoryId ? { ...category, services: [...category.services, newService] } : category,
    )
    setCategories(updatedCategories)
    setFormData({ ...formData, pricing: updatedCategories })
  }

  const updateCategory = (categoryId: string, field: string, value: string) => {
    const updatedCategories = categories.map((category) =>
      category.id === categoryId ? { ...category, [field]: value } : category,
    )
    setCategories(updatedCategories)
    setFormData({ ...formData, pricing: updatedCategories })
  }

  const updateService = (categoryId: string, serviceId: string, field: string, value: string) => {
    const updatedCategories = categories.map((category) =>
      category.id === categoryId
        ? {
            ...category,
            services: category.services.map((service) =>
              service.id === serviceId ? { ...service, [field]: value } : service,
            ),
          }
        : category,
    )
    setCategories(updatedCategories)
    setFormData({ ...formData, pricing: updatedCategories })
  }

  const deleteCategory = (categoryId: string) => {
    const updatedCategories = categories.filter((category) => category.id !== categoryId)
    setCategories(updatedCategories)
    setFormData({ ...formData, pricing: updatedCategories })
  }

  const deleteService = (categoryId: string, serviceId: string) => {
    const updatedCategories = categories.map((category) =>
      category.id === categoryId
        ? { ...category, services: category.services.filter((service) => service.id !== serviceId) }
        : category,
    )
    setCategories(updatedCategories)
    setFormData({ ...formData, pricing: updatedCategories })
  }

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <Card key={category.id}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <Input
                value={category.title}
                onChange={(e) => updateCategory(category.id, "title", e.target.value)}
                className="text-lg font-semibold"
              />
              <Button variant="ghost" size="sm" onClick={() => deleteCategory(category.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            {category.services.map((service) => (
              <div key={service.id} className="mb-4 p-4 border rounded">
                <Input
                  value={service.title}
                  onChange={(e) => updateService(category.id, service.id, "title", e.target.value)}
                  className="mb-2"
                  placeholder="Titre du service"
                />
                <Textarea
                  value={service.description || ""}
                  onChange={(e) => updateService(category.id, service.id, "description", e.target.value)}
                  className="mb-2"
                  placeholder="Description (optionnelle)"
                />
                <div className="flex gap-2">
                  <Input
                    value={service.duration}
                    onChange={(e) => updateService(category.id, service.id, "duration", e.target.value)}
                    placeholder="Durée"
                  />
                  <Input
                    value={service.price}
                    onChange={(e) => updateService(category.id, service.id, "price", e.target.value)}
                    placeholder="Prix"
                  />
                  <Button variant="ghost" size="sm" onClick={() => deleteService(category.id, service.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => addService(category.id)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter un service
            </Button>
          </CardContent>
        </Card>
      ))}
      <Button variant="outline" onClick={addCategory}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Ajouter une catégorie
      </Button>
    </div>
  )
}

