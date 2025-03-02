import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format, isWithinInterval, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type DateRange = {
  from: Date;
  to: Date;
} | undefined;

type Appointment = {
  id: string;
  date: string;
  full_name: string;
  service: string;
  time: string;
  price: number;
};

export function UpcomingAppointments({ dateRange, salonId }: { dateRange: DateRange, salonId: number }) {
  const [appointments, setAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    if (!salonId) return; // Vérifiez que salonId est défini
    const fetchAppointments = async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('salon_id', salonId)
      if (error) {
        console.error('Erreur lors de la récupération des rendez-vous:', error.message)
      } else {
        const sortedAppointments = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        setAppointments(sortedAppointments)
      }
    }
    fetchAppointments()
  }, [salonId])

  const filteredAppointments = appointments.filter(appointment => {
    if (!dateRange?.from || !dateRange?.to) return true;
    const appointmentDate = parseISO(appointment.date);
    return isWithinInterval(appointmentDate, { start: dateRange.from, end: dateRange.to });
  });

  return (
    <div className="space-y-8">
      {filteredAppointments.length === 0 ? (
        <p>Aucun rendez-vous pour la période sélectionnée.</p>
      ) : (
        filteredAppointments.map((appointment) => (
          <div key={appointment.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/avatars/01.png" alt="Avatar" />
              <AvatarFallback>{appointment.full_name[0]}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{appointment.full_name}</p>
              <p className="text-sm text-muted-foreground">
                {appointment.service} ({format(parseISO(appointment.date), 'dd MMMM yyyy', { locale: fr })})
              </p>
            </div>
            <div className="ml-auto font-bold">
              {appointment.price}€
            </div>
          </div>
        ))
      )}
    </div>
  )
}

