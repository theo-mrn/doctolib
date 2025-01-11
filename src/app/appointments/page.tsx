'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CalendarIcon, Phone, Scissors, User, Edit, Trash2 } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { supabase } from '@/lib/supabase'

type Appointment = {
  id: string;
  date: Date;
  full_name: string;
  phone: string;
  service: string;
  salon_id: number;
};

type RawAppointment = {
  id: string;
  date: string;
  time: string;
  full_name: string;
  phone: string;
  service: string;
  salon_id: number;
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [deletingAppointment, setDeletingAppointment] = useState<Appointment | null>(null)
  const [newAppointment, setNewAppointment] = useState<Partial<Appointment>>({
    date: undefined,
    full_name: '',
    phone: '',
    service: ''
  })
  const [salonId, setSalonId] = useState<number | null>(null)
  const [salonFound, setSalonFound] = useState<boolean>(true)

  useEffect(() => {
    const fetchSalonId = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        console.error('❌ Erreur lors de la récupération de l\'utilisateur:', authError?.message)
        return
      }

      const { data: salons, error: salonError } = await supabase
        .from('salons')
        .select('id')
        .eq('professionnel_id', user.id)

      if (salonError) {
        console.error('❌ Erreur lors de la récupération du salon:', salonError.message)
      } else if (salons.length === 1) {
        setSalonId(salons[0].id)
      } else if (salons.length === 0) {
        setSalonFound(false)
      } else {
        console.error('❌ Erreur : plusieurs salons trouvés pour cet utilisateur.')
      }
    }

    fetchSalonId()
  }, [])

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!salonId) return

      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('salon_id', salonId)

      if (error) {
        console.error('❌ Erreur lors de la récupération des rendez-vous :', error.message)
      } else {
        const formattedAppointments = data.map((appointment: RawAppointment) => ({
          ...appointment,
          date: new Date(appointment.date + 'T' + appointment.time)
        }))
        setAppointments(formattedAppointments)
      }
    }

    fetchAppointments()
  }, [salonId])

  const filteredAppointments = filterDate
    ? appointments.filter(
        (appointment) =>
          appointment.date.toDateString() === filterDate.toDateString()
      )
    : appointments

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newAppointment.date && newAppointment.full_name && newAppointment.phone && newAppointment.service && salonId) {
      const appointmentDate = new Date(newAppointment.date as unknown as string)
      const { error } = await supabase
        .from('reservations')
        .insert([
          {
            date: appointmentDate.toISOString().split('T')[0],
            time: appointmentDate.toTimeString().split(' ')[0],
            full_name: newAppointment.full_name,
            phone: newAppointment.phone,
            service: newAppointment.service,
            salon_id: salonId,
          },
        ])

      if (error) {
        console.error('❌ Erreur lors de l\'ajout du rendez-vous :', error.message)
      } else {
        setAppointments([...appointments, {
          id: Date.now().toString(),
          date: appointmentDate,
          full_name: newAppointment.full_name,
          phone: newAppointment.phone,
          service: newAppointment.service,
          salon_id: salonId,
        }])
        setIsAddDialogOpen(false)
        setNewAppointment({
          date: undefined,
          full_name: '',
          phone: '',
          service: ''
        })
      }
    }
  }

  const handleEditAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingAppointment) {
      const { error } = await supabase
        .from('reservations')
        .update({
          date: editingAppointment.date.toISOString().split('T')[0],
          time: editingAppointment.date.toTimeString().split(' ')[0],
          full_name: editingAppointment.full_name,
          phone: editingAppointment.phone,
          service: editingAppointment.service,
        })
        .eq('id', editingAppointment.id)

      if (error) {
        console.error('❌ Erreur lors de la modification du rendez-vous :', error.message)
      } else {
        setAppointments(
          appointments.map((appointment) =>
            appointment.id === editingAppointment.id ? editingAppointment : appointment
          )
        )
        setEditingAppointment(null)
      }
    }
  }

  const handleDeleteAppointment = async () => {
    if (deletingAppointment) {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', deletingAppointment.id)

      if (error) {
        console.error('❌ Erreur lors de la suppression du rendez-vous :', error.message)
      } else {
        setAppointments(appointments.filter((appointment) => appointment.id !== deletingAppointment.id))
        setDeletingAppointment(null)
      }
    }
  }

  if (!salonFound) {
    return <div className="container mx-auto py-10"><h1 className="text-3xl font-bold mb-6">Aucun salon trouvé</h1></div>
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Rendez-vous du salon de coiffure</h1>
      
      <div className="flex justify-between items-center mb-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filterDate ? format(filterDate, 'PPP', { locale: fr }) : 'Sélectionner une date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={filterDate}
              onSelect={setFilterDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button onClick={() => setIsAddDialogOpen(true)}>Ajouter un rendez-vous</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date et heure</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Téléphone</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAppointments.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell>
                <div className="flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(appointment.date, "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  {appointment.full_name}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4" />
                  {appointment.phone}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Scissors className="mr-2 h-4 w-4" />
                  {appointment.service}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={() => setEditingAppointment(appointment)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setDeletingAppointment(appointment)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add Appointment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un rendez-vous</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddAppointment} className="space-y-4">
            <div>
              <Label htmlFor="date">Date et heure</Label>
              <Input
                id="date"
                type="datetime-local"
                value={newAppointment.date ? (newAppointment.date as unknown as string) : ''}
                onChange={(e) => setNewAppointment({ ...newAppointment, date: new Date(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label htmlFor="clientName">Nom du client</Label>
              <Input
                id="clientName"
                value={newAppointment.full_name || ''}
                onChange={(e) => setNewAppointment({ ...newAppointment, full_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
              <Input
                id="phoneNumber"
                value={newAppointment.phone || ''}
                onChange={(e) => setNewAppointment({ ...newAppointment, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="service">Service</Label>
              <Input
                id="service"
                value={newAppointment.service || ''}
                onChange={(e) => setNewAppointment({ ...newAppointment, service: e.target.value })}
                required
              />
            </div>
            <Button type="submit">Ajouter</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Appointment Dialog */}
      <Dialog open={!!editingAppointment} onOpenChange={() => setEditingAppointment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le rendez-vous</DialogTitle>
          </DialogHeader>
          {editingAppointment && (
            <form onSubmit={handleEditAppointment} className="space-y-4">
              <div>
                <Label htmlFor="editDate">Date et heure</Label>
                <Input
                  id="editDate"
                  type="datetime-local"
                  value={format(editingAppointment.date, "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, date: new Date(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editClientName">Nom du client</Label>
                <Input
                  id="editClientName"
                  value={editingAppointment.full_name}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, full_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editPhoneNumber">Numéro de téléphone</Label>
                <Input
                  id="editPhoneNumber"
                  value={editingAppointment.phone}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, phone: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editService">Service</Label>
                <Input
                  id="editService"
                  value={editingAppointment.service}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, service: e.target.value })}
                  required
                />
              </div>
              <Button type="submit">Enregistrer les modifications</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingAppointment} onOpenChange={() => setDeletingAppointment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le rendez-vous suivant ?
              <br />
              {deletingAppointment && (
                <strong>
                  {deletingAppointment.full_name} - {format(deletingAppointment.date, "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                </strong>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingAppointment(null)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDeleteAppointment}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

