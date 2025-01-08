'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Appointment } from './appointment-list'
import { format } from 'date-fns'

type EditAppointmentDialogProps = {
  isOpen: boolean
  onClose: () => void
  onEdit: (appointment: Appointment) => void
  appointment: Appointment
}

export function EditAppointmentDialog({ isOpen, onClose, onEdit, appointment }: EditAppointmentDialogProps) {
  const [editedAppointment, setEditedAppointment] = useState<Appointment>(appointment)

  useEffect(() => {
    setEditedAppointment(appointment)
  }, [appointment])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onEdit(editedAppointment)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le rendez-vous</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date">Date et heure</Label>
            <Input
              id="date"
              type="datetime-local"
              value={format(editedAppointment.date, "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) => setEditedAppointment({ ...editedAppointment, date: new Date(e.target.value) })}
              required
            />
          </div>
          <div>
            <Label htmlFor="clientName">Nom du client</Label>
            <Input
              id="clientName"
              value={editedAppointment.clientName}
              onChange={(e) => setEditedAppointment({ ...editedAppointment, clientName: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
            <Input
              id="phoneNumber"
              value={editedAppointment.phoneNumber}
              onChange={(e) => setEditedAppointment({ ...editedAppointment, phoneNumber: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="service">Service</Label>
            <Input
              id="service"
              value={editedAppointment.service}
              onChange={(e) => setEditedAppointment({ ...editedAppointment, service: e.target.value })}
              required
            />
          </div>
          <Button type="submit">Enregistrer les modifications</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

