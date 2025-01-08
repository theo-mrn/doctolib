'use client'

import { useState, useEffect } from 'react'
import { Scissors, Calendar, Clock, MapPin, Trash2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { supabase } from "@/lib/supabase"; 
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
  id: string 
  date: string
  time: string
  salon: string
  address: string
  clientName: string
}

const fetchAppointments = async (userId: string) => {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      salons (
        nom_salon,
        adresse
      )
    `)
    .eq('client_id', userId)

  if (error) {
    console.error('Error fetching appointments:', error.message)
    return []
  }

  return data.map((reservation: any) => ({
    id: reservation.id,
    date: reservation.date,
    time: reservation.time,
    salon: reservation.salons.nom_salon,
    address: reservation.salons.adresse,
    clientName: reservation.full_name,
  }))
}

export default function AppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserId = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        console.error('❌ Erreur lors de la récupération de l\'utilisateur:', authError?.message)
        return
      }
      setUserId(user.id)
    }

    fetchUserId()
  }, [])

  useEffect(() => {
    const getAppointments = async () => {
      if (userId) {
        const fetchedAppointments = await fetchAppointments(userId)
        setAppointments(fetchedAppointments)
      }
    }

    getAppointments()
  }, [userId])

  const cancelAppointment = async (id: string) => {
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting appointment:', error.message)
      return
    }

    setAppointments(appointments.filter(appointment => appointment.id !== id))
    setAppointmentToDelete(null)
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <Card key={appointment.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scissors className="h-5 w-5" />
              {appointment.salon}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{appointment.clientName}</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{new Date(appointment.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{appointment.time}</span>
              </div>
              <Separator />
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{appointment.address}</span>
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
                  <DialogTitle>Confirmer l'annulation</DialogTitle>
                  <DialogDescription>
                    Êtes-vous sûr de vouloir annuler ce rendez-vous pour {appointment.clientName} ? Cette action ne peut pas être annulée.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAppointmentToDelete(null)}>Annuler</Button>
                  <Button variant="destructive" onClick={() => appointmentToDelete && cancelAppointment(appointmentToDelete)}>Confirmer</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

