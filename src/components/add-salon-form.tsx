'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { TimePicker } from "@/components/ui/time-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const salonSchema = z.object({
  nom_salon: z.string().min(1, "Le nom du salon est requis"),
  adresse: z.string().min(1, "L'adresse est requise"),
  code_postal: z.string().min(5, "Le code postal doit contenir au moins 5 caractères"),
  ville: z.string().min(1, "La ville est requise"),
  specialite: z.string().min(1, "La spécialité est requise"),
  description: z.string().optional(),
  image: z.instanceof(File).optional(),
  ouverture: z.array(z.object({
    jour: z.string(),
    ouvert: z.boolean(),
    debut: z.string().optional(),
    fin: z.string().optional(),
  })),
  prestations: z.array(z.string()).min(1, "Au moins une prestation est requise"),
  pricing: z.array(z.object({
    service: z.string(),
    prix: z.number().min(0, "Le prix doit être un nombre positif"),
  })),
})

type SalonFormValues = z.infer<typeof salonSchema>

const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

const PriceInput = ({ value, onChange }) => {
  return (
    <Input
      type="number"
      step="0.50"
      min="0"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      placeholder="Prix"
    />
  );
};

export function AddSalonForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('sb-sijvzedmeayxyqybephs-auth-token');
    if (token) {
      try {
        const user = JSON.parse(atob(token.split('.')[1]));
        if (user && user.sub) {
          console.log('User sub:', user.sub); 
        } else {
          console.error('User ou sub non défini dans le token.');
        }
      } catch (error) {
        console.error('Erreur lors de l\'analyse du token :', error);
      }
    }
  }, []);

  const form = useForm<SalonFormValues>({
    resolver: zodResolver(salonSchema),
    defaultValues: {
      nom_salon: "",
      adresse: "",
      code_postal: "",
      ville: "",
      specialite: "",
      description: "",
      ouverture: jours.map(jour => ({ jour, ouvert: false, debut: '09:00', fin: '18:00' })),
      prestations: [],
      pricing: [],
    },
  });

  const { fields: prestationsFields, append: appendPrestation, remove: removePrestation } = useFieldArray({
    control: form.control,
    name: "prestations",
  });

  const { fields: pricingFields, append: appendPricing, remove: removePricing } = useFieldArray({
    control: form.control,
    name: "pricing",
  });

  const onSubmit = async (values: SalonFormValues) => {
    console.log('Form submitted', values);
    setIsSubmitting(true);
    setSubmitMessage('');
    try {
      for (const pricing of values.pricing) {
        if (isNaN(pricing.prix) || pricing.prix < 0) {
          setSubmitMessage('Veuillez entrer un prix valide pour chaque service.');
          setIsSubmitting(false);
          return;
        }
      }

      const token = localStorage.getItem('sb-sijvzedmeayxyqybephs-auth-token');
      if (!token) {
        throw new Error("Token non trouvé dans le local storage.");
      }

      const user = JSON.parse(atob(token.split('.')[1]));

      if (!user || !user.sub) {
        console.log('User:', user); 
        throw new Error("Utilisateur non authentifié.");
      }

      console.log('User ID:', user.sub); 

      let imageUrl = '';

      const { data: salonData, error: salonError } = await supabase
        .from('salons')
        .insert([{
          nom_salon: values.nom_salon,
          adresse: values.adresse,
          code_postal: values.code_postal,
          ville: values.ville,
          specialite: values.specialite,
          description: values.description,
          ouverture: Object.fromEntries(
            values.ouverture.map(({ jour, ouvert, debut, fin }) => [
              jour.toLowerCase(),
              ouvert ? { start: debut, end: fin } : 'Fermé'
            ])
          ),
          prestations: values.prestations,
          pricing: Object.fromEntries(values.pricing.map(({ service, prix }) => [service, prix])),
          professionnel_id: user.sub, 
        }])
        .select('id')
        .single();

      if (salonError) {
        console.error('Erreur lors de l\'ajout du salon :', salonError.message);
        setSubmitMessage('Erreur lors de l\'ajout du salon.');
        setIsSubmitting(false);
        return;
      }

      const salonId = salonData.id;

      if (values.image) {
        const { data, error: uploadError } = await supabase.storage
          .from('image_salons')
          .upload(`public/${salonId}/${values.image.name}`, values.image);

        if (uploadError) {
          console.error('Erreur lors du téléchargement de l\'image :', uploadError.message);
          setSubmitMessage('Erreur lors du téléchargement de l\'image.');
          setIsSubmitting(false);
          return;
        }

        const { data: urlData, error: urlError } = supabase
          .storage
          .from('image_salons')
          .getPublicUrl(`public/${salonId}/${values.image.name}`);

        if (urlError) {
          console.error('Erreur lors de la récupération de l\'URL de l\'image :', urlError.message);
          setSubmitMessage('Erreur lors de la récupération de l\'URL de l\'image.');
          setIsSubmitting(false);
          return;
        }

        imageUrl = urlData.publicUrl;

        const { error: updateError } = await supabase
          .from('salons')
          .update({ image_url: imageUrl })
          .eq('id', salonId);

        if (updateError) {
          console.error('Erreur lors de la mise à jour de l\'URL de l\'image :', updateError.message);
          setSubmitMessage('Erreur lors de la mise à jour de l\'URL de l\'image.');
          setIsSubmitting(false);
          return;
        }
      }

      console.log('Salon ajouté avec succès.');
      setSubmitMessage('Salon ajouté avec succès.');
      form.reset();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du salon :', error);
      setSubmitMessage(`Erreur lors de l'ajout du salon : ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="nom_salon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du salon</FormLabel>
              <FormControl>
                <Input placeholder="Nom du salon" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="adresse"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <Input placeholder="Adresse" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="code_postal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code postal</FormLabel>
              <FormControl>
                <Input placeholder="Code postal" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ville"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ville</FormLabel>
              <FormControl>
                <Input placeholder="Ville" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="specialite"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Spécialité</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une spécialité" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="coiffure">Coiffure</SelectItem>
                  <SelectItem value="esthetique">Esthétique</SelectItem>
                  <SelectItem value="massage">Massage</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Description du salon" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Image du salon</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onChange(e.target.files?.[0])}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
          <h3 className="text-lg font-medium mb-2">Horaires d'ouverture</h3>
          {form.watch('ouverture').map((jour, index) => (
            <Card key={jour.jour} className="mb-2">
              <CardContent className="p-4 flex items-center space-x-4">
                <FormField
                  control={form.control}
                  name={`ouverture.${index}.ouvert`}
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">{jour.jour}</FormLabel>
                    </FormItem>
                  )}
                />
                {form.watch(`ouverture.${index}.ouvert`) && (
                  <>
                    <Controller
                      name={`ouverture.${index}.debut`}
                      control={form.control}
                      render={({ field }) => (
                        <TimePicker
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    <Controller
                      name={`ouverture.${index}.fin`}
                      control={form.control}
                      render={({ field }) => (
                        <TimePicker
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Prestations</h3>
          {prestationsFields.map((field, index) => (
            <FormField
              key={field.id}
              control={form.control}
              name={`prestations.${index}`}
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 mb-2">
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removePrestation(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </FormItem>
              )}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => appendPrestation("")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une prestation
          </Button>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Tarification</h3>
          {pricingFields.map((field, index) => (
            <div key={field.id} className="flex items-center space-x-2 mb-2">
              <FormField
                control={form.control}
                name={`pricing.${index}.service`}
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input {...field} placeholder="Service" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`pricing.${index}.prix`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <PriceInput {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => removePricing(index)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => appendPricing({ service: "", prix: 0 })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un tarif
          </Button>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Ajout en cours...' : 'Ajouter le salon'}
        </Button>
        {submitMessage && <p>{submitMessage}</p>}
      </form>
    </Form>
  );
}

