"use client";

import { useState } from 'react';
import { Scissors, Calendar, Clock, MapPin, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from "@/lib/supabase"; 
import dayjs from 'dayjs';
import { useToast } from "@/hooks/use-toast"; 
import 'dayjs/locale/fr';

dayjs.locale('fr');

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Appointment {
  id: number;
  full_name: string;
  client_id: string;
  date: string;
  time: string;
  duree: number;
  salons: {
    nom_salon: string;
    adresse: string;
  };
}

interface AppointmentListProps {
  appointments: Appointment[];
}

export default function AppointmentList({ appointments: initialAppointments }: AppointmentListProps) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const { toast } = useToast();
  const [appointmentToDelete, setAppointmentToDelete] = useState<number | null>(null);

  const cancelAppointment = async (id: number) => {
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'annulation du rendez-vous.",
        variant: "destructive",
      });
      console.error('Error deleting appointment:', error.message);
      return;
    }

    setAppointments(prevAppointments =>
      prevAppointments.filter(appointment => appointment.id !== id)
    );

    toast({
      title: "Rendez-vous annulé",
      description: "Le rendez-vous a bien été annulé.",
    });
    setAppointmentToDelete(null);
  };

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <Card key={appointment.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scissors className="h-5 w-5" />
              {appointment.salons.nom_salon}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{appointment.full_name}</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{dayjs(appointment.date).format('dddd D MMMM YYYY')}</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{dayjs(`${appointment.date}T${appointment.time}`).format('HH:mm')}</span>
              </div>
              <Separator />
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{appointment.salons.adresse}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto group overflow-hidden"
                  onClick={() => setAppointmentToDelete(appointment.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out ml-0 group-hover:ml-2">
                    Annuler
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmer l&apos;annulation</DialogTitle>
                  <DialogDescription>
                    Êtes-vous sûr de vouloir annuler ce rendez-vous pour {appointment.full_name} ? Cette action est irréversible.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAppointmentToDelete(null)}>Annuler</Button>
                  <Button
                    variant="destructive"
                    onClick={() => appointmentToDelete && cancelAppointment(appointmentToDelete)}
                  >
                    Confirmer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}