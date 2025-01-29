"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PlusCircle, Trash2 } from "lucide-react"
import type { PricingData, ServiceDetails } from "@/types/salon"

interface PricingProps {
  formData: {
    pricing?: PricingData | null;
  };
  updateFormData: (field: 'pricing', value: PricingData | null) => void;
}

interface Service {
  id: string
  title: string
  description?: string
  duration: string
  price: string
}

interface Category {
  id: string
  title: string
  services: Service[]
}

const defaultPricing: PricingData = {
  "Femme": {
    "Coupe longue": {
      "price": 0,
      "duration": "1h",
      "description": ""
    }
  },
  "Homme": {
    "coupe courte": {
      "price": 0,
      "duration": "1h",
      "description": ""
    }
  }
}

const convertJsonToCategories = (jsonPricing: PricingData): Category[] => {
  return Object.entries(jsonPricing).map(([categoryName, services]) => ({
    id: categoryName,
    title: categoryName,
    services: Object.entries(services).map(([serviceName, details]) => ({
      id: serviceName,
      title: serviceName,
      description: details.description || "",
      duration: details.duration || "1h",
      price: details.price?.toString() || "0"
    }))
  }))
}

// Fonction de conversion des catégories en format JSON
const convertCategoriesToJson = (categories: Category[]): PricingData => {
  return categories.reduce((acc, category) => {
    acc[category.title] = category.services.reduce((serviceAcc, service) => {
      serviceAcc[service.title] = {
        price: Number(service.price),
        duration: service.duration,
        ...(service.description && { description: service.description })
      };
      return serviceAcc;
    }, {} as { [key: string]: ServiceDetails });
    return acc;
  }, {} as PricingData);
};

export default function Pricing({ formData, updateFormData }: PricingProps) {
  const [categories, setCategories] = useState<Category[]>(() => {
    if (Array.isArray(formData.pricing)) {
      return formData.pricing
    }
    if (formData.pricing && typeof formData.pricing === 'object') {
      return convertJsonToCategories(formData.pricing)
    }
    // Si aucun pricing n'existe, utiliser les valeurs par défaut
    return convertJsonToCategories(defaultPricing)
  })

  const updateParentFormData = useCallback(() => {
    const jsonData = convertCategoriesToJson(categories);
    updateFormData('pricing', jsonData);
  }, [categories, updateFormData])

  useEffect(() => {
    updateParentFormData()
  }, [updateParentFormData])

  const addCategory = (e: React.MouseEvent) => {
    e.preventDefault(); // Empêcher la propagation
    const newCategoryName = "Nouvelle catégorie";
    setCategories((prev) => [
      ...prev,
      {
        id: Date.now().toString(), // ID uniquement pour React, ne sera pas sauvegardé
        title: newCategoryName,
        services: [],
      },
    ])
  }

  const addService = (e: React.MouseEvent, categoryId: string) => {
    e.preventDefault(); // Empêcher la propagation
    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              services: [
                ...category.services,
                {
                  id: Date.now().toString(), // ID uniquement pour React, ne sera pas sauvegardé
                  title: "Nouveau service",
                  duration: "1h",
                  price: "0",
                },
              ],
            }
          : category,
      ),
    )
  }

  const updateCategory = (categoryId: string, field: string, value: string) => {
    setCategories((prev) =>
      prev.map((category) => (category.id === categoryId ? { ...category, [field]: value } : category)),
    )
  }

  const updateService = (categoryId: string, serviceId: string, field: string, value: string) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              services: category.services.map((service) =>
                service.id === serviceId ? { ...service, [field]: value } : service,
              ),
            }
          : category,
      ),
    )
  }

  const deleteCategory = (categoryId: string) => {
    setCategories((prev) => prev.filter((category) => category.id !== categoryId))
  }

  const deleteService = (categoryId: string, serviceId: string) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? { ...category, services: category.services.filter((service) => service.id !== serviceId) }
          : category,
      ),
    )
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
            <Button 
              type="button" // Explicitement définir le type
              variant="outline" 
              size="sm" 
              onClick={(e) => addService(e, category.id)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter un service
            </Button>
          </CardContent>
        </Card>
      ))}
      <Button 
        type="button" // Explicitement définir le type
        variant="outline" 
        onClick={addCategory}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Ajouter une catégorie
      </Button>
    </div>
  )
}

