"use client"

import { useEffect, useState } from "react"
import { addDays, format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon, MoreHorizontal, Pencil, Trash } from 'lucide-react'
import { DateRange } from "react-day-picker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { formatISO } from "date-fns"

export function AppointmentCalendar() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  })
  const [appointments, setAppointments] = useState<{ id: string; client: string; service: string; time: string; date: string }[]>([])
  const [editingAppointment, setEditingAppointment] = useState<typeof appointments[0] | null>(null)

  useEffect(() => {
    const fetchAppointments = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        console.error('❌ Erreur lors de la récupération de l\'utilisateur:', authError?.message)
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('salon')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('❌ Erreur lors de la récupération du profil:', profileError.message)
        return
      }

      const salonId = profile.salon

      const { data: reservations, error } = await supabase
        .from('reservations')
        .select('id, full_name, service, time, date')
        .eq('salon_id', salonId)

      if (error) {
        console.error('❌ Erreur lors de la récupération des réservations :', error.message)
      } else {
        const now = new Date()
        const upcomingReservations = reservations.filter((reservation: any) => new Date(reservation.date) >= now)
        setAppointments(upcomingReservations.map((reservation: any) => ({
          id: reservation.id,
          client: reservation.full_name,
          service: reservation.service,
          time: reservation.time,
          date: reservation.date,
        })))
      }
    }

    fetchAppointments()
  }, [])

  useEffect(() => {
    if (!date?.from || !date?.to) return

    const fetchAppointmentsInRange = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        console.error('❌ Erreur lors de la récupération de l\'utilisateur:', authError?.message)
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('salon')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('❌ Erreur lors de la récupération du profil:', profileError.message)
        return
      }

      const salonId = profile.salon

      const { data: reservations, error } = await supabase
        .from('reservations')
        .select('id, full_name, service, time, date')
        .eq('salon_id', salonId)
        .gte('date', formatISO(date.from))
        .lte('date', formatISO(date.to))

      if (error) {
        console.error('❌ Erreur lors de la récupération des réservations :', error.message)
      } else {
        setAppointments(reservations.map((reservation: any) => ({
          id: reservation.id,
          client: reservation.full_name,
          service: reservation.service,
          time: reservation.time,
          date: reservation.date,
        })))
      }
    }

    fetchAppointmentsInRange()
  }, [date])

  const handleEdit = async (appointment: typeof appointments[0]) => {
    setEditingAppointment(appointment)
  }

  const handleSave = async () => {
    if (!editingAppointment) return

    const { id, client, service, time, date } = editingAppointment
    const updatedDate = new Date(date)
    const [hours, minutes] = time.split(':')
    updatedDate.setHours(parseInt(hours), parseInt(minutes))

    const { error } = await supabase
      .from('reservations')
      .update({ full_name: client, service, time, date: updatedDate.toISOString() })
      .eq('id', id)

    if (error) {
      console.error('❌ Erreur lors de la mise à jour du rendez-vous :', error.message)
    } else {
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...editingAppointment, date: updatedDate.toISOString() } : apt))
      )
      setEditingAppointment(null)
    }
  }

  const handleDelete = async (id: number) => {
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ Erreur lors de la suppression du rendez-vous :', error.message)
    } else {
      setAppointments((prev) => prev.filter((apt) => apt.id !== id))
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Calendrier des rendez-vous</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "dd/MM/yyyy", { locale: fr })} -{" "}
                      {format(date.to, "dd/MM/yyyy", { locale: fr })}
                    </>
                  ) : (
                    format(date.from, "dd/MM/yyyy", { locale: fr })
                  )
                ) : (
                  <span>Choisir une date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                locale={fr}
              />
            </PopoverContent>
          </Popover>

          <div className="space-y-4">
            <h3 className="font-medium">Rendez-vous du jour</h3>
            <div className="space-y-2">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{apt.client}</p>
                    <p className="text-sm text-muted-foreground">{apt.service}</p>
                    <p className="text-sm text-muted-foreground">{apt.time.slice(0, 5)}</p> {/* Afficher uniquement les heures */}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{format(new Date(apt.date), "dd/MM")}</p> {/* Formater la date en dd/MM */}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleEdit(apt) }}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Modifier le rendez-vous</DialogTitle>
                            <DialogDescription>
                              Modifiez les détails du rendez-vous ci-dessous.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="date">Date</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !editingAppointment?.date && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {editingAppointment?.date ? (
                                      format(new Date(editingAppointment.date), "dd/MM/yyyy", { locale: fr })
                                    ) : (
                                      <span>Choisir une date</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={new Date(editingAppointment?.date || '')}
                                    onSelect={(date) => setEditingAppointment((prev) => prev ? { ...prev, date: date.toISOString() } : null)}
                                    locale={fr}
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="time">Heure</Label>
                              <Input
                                id="time"
                                type="time"
                                value={editingAppointment?.time || ''}
                                onChange={(e) => setEditingAppointment((prev) => prev ? { ...prev, time: e.target.value } : null)}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="service">Service</Label>
                              <Input
                                id="service"
                                value={editingAppointment?.service || ''}
                                onChange={(e) => setEditingAppointment((prev) => prev ? { ...prev, service: e.target.value } : null)}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button onClick={handleSave}>Enregistrer</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onSelect={() => handleDelete(apt.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

