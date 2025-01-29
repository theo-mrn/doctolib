import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import type { Category, PricingData } from '@/types/salon';  // Importer le type depuis le fichier de types

interface Service {
  id: string;
  title: string;
  description?: string;
  duration: string;
  price: string;
}

type BeautyServicesProps = {
  salon: {
    id: string;
    prestations?: string[];
    pricing?: PricingData | null;  // Mettre à jour pour utiliser PricingData au lieu de Category[]
  }
}

interface PricingDetails {
  price: number;
  duration: string;
  description?: string;
}

interface RawPricingData {
  [category: string]: {
    [service: string]: PricingDetails;
  };
}

function transformPricingData(data: RawPricingData): Category[] {
  return Object.entries(data).map(([categoryName, services]) => ({
    id: categoryName,
    title: categoryName,
    services: Object.entries(services).map(([serviceName, details]: [string, PricingDetails]) => ({
      id: serviceName,
      title: serviceName,
      description: details.description || '',
      duration: details.duration,
      price: `${details.price}€`
    }))
  }));
}

export default function BeautyServices({ salon }: BeautyServicesProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (salon.pricing && typeof salon.pricing === 'object') {
      const transformedData = transformPricingData(salon.pricing as RawPricingData);
      setCategories(transformedData);
    }
  }, [salon]);

  if (!categories || categories.length === 0) {
    return <div>Aucun service disponible</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-12 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Services de beauté</h1>
      </div>

      {categories.map(category => (
        <section key={category.id}>
          <h2 className="text-xl tracking-wide mb-6">{category.title}</h2>
          <Card className="bg-white rounded-xl">
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {category.services.map(service => (
                  <ServiceItem
                    key={service.id}
                    service={service}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      ))}
    </div>
  );
}

interface ServiceItemProps {
  service: Service;
}

function ServiceItem({ service }: ServiceItemProps) {
  return (
    <div className="px-6 py-4">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium">{service.title}</h3>
          {service.description && (
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {service.description}
            </p>
          )}
        </div>
        <div className="text-right shrink-0 flex items-center gap-2">
          <div className="text-sm text-muted-foreground">{service.duration}</div>
          <div className="text-sm font-medium">{service.price}</div>
        </div>
      </div>
    </div>
  );
}

