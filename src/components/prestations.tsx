import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, Edit, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Service {
  id: string;
  title: string;
  description?: string;
  duration: string;
  price: string;
}

interface Category {
  id: string;
  title: string;
  services: Service[];
}

interface BeautyServicesProps {
  salon: {
    id: string;
    prestations?: string[];
    pricing?: Record<string, any>;
  };
}

export default function BeautyServices({ salon }: BeautyServicesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (salon.pricing) {
      const newCategories: Category[] = Object.entries(salon.pricing).map(([categoryTitle, services], index) => ({
        id: index.toString(),
        title: categoryTitle,
        services: Object.entries(services).map(([serviceTitle, details], serviceIndex) => ({
          id: serviceIndex.toString(),
          title: serviceTitle,
          description: details.description,
          duration: details.duration,
          price: `${details.price} €`,
        })),
      }));
      setCategories(newCategories);
    }
  }, [salon]);

  const handleSaveChanges = async () => {
    const updatedPricing = categories.reduce((acc, category) => {
      acc[category.title] = category.services.reduce((serviceAcc, service) => {
        serviceAcc[service.title] = {
          description: service.description,
          duration: service.duration,
          price: parseFloat(service.price.replace(' €', '')),
        };
        return serviceAcc;
      }, {} as Record<string, { description?: string; duration: string; price: number }>);
      return acc;
    }, {} as Record<string, Record<string, { description?: string; duration: string; price: number }>>);

    const { error } = await supabase
      .from('salons')
      .update({ pricing: updatedPricing })
      .eq('id', salon.id);

    if (error) {
      console.error('Erreur lors de la mise à jour :', error.message);
    } else {
      console.log('Tarification mise à jour avec succès.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-12 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Services de beauté</h1>
        <Button onClick={() => {
          if (isEditing) handleSaveChanges();
          setIsEditing(!isEditing);
        }}>
          {isEditing ? <Save className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
          {isEditing ? 'Sauvegarder' : 'Modifier'}
        </Button>
      </div>

      {categories.map(category => (
        <section key={category.id}>
          {isEditing ? (
            <div className="flex items-center mb-6">
              <Input
                value={category.title}
                onChange={(e) => {
                  const newCategories = categories.map(cat =>
                    cat.id === category.id ? { ...cat, title: e.target.value } : cat
                  );
                  setCategories(newCategories);
                }}
                className="text-xl font-semibold"
              />
              <Button variant="ghost" size="sm" onClick={() => setCategories(categories.filter(cat => cat.id !== category.id))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <h2 className="text-xl tracking-wide mb-6">{category.title}</h2>
          )}
          <Card className="bg-white rounded-xl">
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {category.services.map(service => (
                  <ServiceItem
                    key={service.id}
                    service={service}
                    isEditing={isEditing}
                    onUpdate={(updatedService) => {
                      const newCategories = categories.map(cat =>
                        cat.id === category.id ? {
                          ...cat,
                          services: cat.services.map(srv =>
                            srv.id === service.id ? { ...srv, ...updatedService } : srv
                          )
                        } : cat
                      );
                      setCategories(newCategories);
                    }}
                    onDelete={() => {
                      const newCategories = categories.map(cat =>
                        cat.id === category.id ? {
                          ...cat,
                          services: cat.services.filter(srv => srv.id !== service.id)
                        } : cat
                      );
                      setCategories(newCategories);
                    }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
          {isEditing && (
            <Button variant="outline" size="sm" onClick={() => {
              const newService: Service = {
                id: Date.now().toString(),
                title: 'Nouveau service',
                duration: '1h',
                price: '0 €'
              };
              const newCategories = categories.map(cat =>
                cat.id === category.id ? { ...cat, services: [...cat.services, newService] } : cat
              );
              setCategories(newCategories);
            }} className="mt-4">
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter un service
            </Button>
          )}
        </section>
      ))}

      {isEditing && (
        <Button variant="outline" onClick={() => {
          const newCategory: Category = {
            id: Date.now().toString(),
            title: 'Nouvelle catégorie',
            services: []
          };
          setCategories([...categories, newCategory]);
        }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter une catégorie
        </Button>
      )}
    </div>
  );
}

interface ServiceItemProps {
  service: Service;
  isEditing: boolean;
  onUpdate: (updatedService: Service) => void;
  onDelete: () => void;
}

function ServiceItem({ service, isEditing, onUpdate, onDelete }: ServiceItemProps) {
  if (isEditing) {
    return (
      <div className="px-6 py-4">
        <div className="flex flex-col gap-2">
          <Input
            value={service.title}
            onChange={(e) => onUpdate({ ...service, title: e.target.value })}
            placeholder="Titre du service"
          />
          <Textarea
            value={service.description || ''}
            onChange={(e) => onUpdate({ ...service, description: e.target.value })}
            placeholder="Description (optionnelle)"
          />
          <div className="flex gap-2">
            <Input
              value={service.duration}
              onChange={(e) => onUpdate({ ...service, duration: e.target.value })}
              placeholder="Durée"
            />
            <Input
              value={service.price}
              onChange={(e) => onUpdate({ ...service, price: e.target.value })}
              placeholder="Prix"
            />
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

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

