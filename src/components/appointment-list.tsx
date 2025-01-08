'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CalendarIcon, Phone, Scissors, User, Edit, Trash2 } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { AddAppointmentDialog } from './add-appointment-dialog'
import { EditAppointmentDialog } from './edit-appointment-dialog'
import { DeleteConfirmationDialog } from './delete-confirmation-dialog'

export type Appointment = {
  id: string
  date: Date
  clientName: string
  phoneNumber: string
  service: string
  salonName: string 
}



export function AppointmentList({ appointments }: { appointments: Appointment[] }) {
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [deletingAppointment, setDeletingAppointment] = useState<Appointment | null>(null)

  const filteredAppointments = filterDate
    ? appointments.filter(
        (appointment) =>
          appointment.date.toDateString() === filterDate.toDateString()
      )
    : appointments

  const handleAddAppointment = (newAppointment: Appointment) => {
    setAppointments([...appointments, newAppointment])
    setIsAddDialogOpen(false)
  }

  const handleEditAppointment = (updatedAppointment: Appointment) => {
    setAppointments(
      appointments.map((appointment) =>
        appointment.id === updatedAppointment.id ? updatedAppointment : appointment
      )
    )
    setEditingAppointment(null)
  }

  const handleDeleteAppointment = (id: string) => {
    setAppointments(appointments.filter((appointment) => appointment.id !== id))
    setDeletingAppointment(null)
  }

  return (
    <div>
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
            <TableHead>Salon</TableHead>
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
                  {appointment.clientName}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4" />
                  {appointment.phoneNumber}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Scissors className="mr-2 h-4 w-4" />
                  {appointment.service}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <span className="mr-2 h-4 w-4" />
                  {appointment.salonName} 
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
      <AddAppointmentDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddAppointment}
      />
      {editingAppointment && (
        <EditAppointmentDialog
          isOpen={!!editingAppointment}
          onClose={() => setEditingAppointment(null)}
          onEdit={handleEditAppointment}
          appointment={editingAppointment}
        />
      )}
      {deletingAppointment && (
        <DeleteConfirmationDialog
          isOpen={!!deletingAppointment}
          onClose={() => setDeletingAppointment(null)}
          onConfirm={() => handleDeleteAppointment(deletingAppointment.id)}
          appointmentDetails={`${deletingAppointment.clientName} - ${format(deletingAppointment.date, "d MMMM yyyy 'à' HH:mm", { locale: fr })}`}
        />
      )}
    </div>
  )
}

