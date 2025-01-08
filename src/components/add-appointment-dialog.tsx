'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Appointment } from './appointment-list'

type AddAppointmentDialogProps = {
  isOpen: boolean
  onClose: () => void
  onAdd: (appointment: Appointment) => void
}

export function AddAppointmentDialog({ isOpen, onClose, onAdd }: AddAppointmentDialogProps) {
  const [newAppointment, setNewAppointment] = useState<Partial<Appointment>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newAppointment.date && newAppointment.clientName && newAppointment.phoneNumber && newAppointment.service) {
      onAdd({
        id: Date.now().toString(),
        date: new Date(newAppointment.date),
        clientName: newAppointment.clientName,
        phoneNumber: newAppointment.phoneNumber,
        service: newAppointment.service,
      })
      setNewAppointment({})
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un rendez-vous</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date">Date et heure</Label>
            <Input
              id="date"
              type="datetime-local"
              value={newAppointment.date as string}
              onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="clientName">Nom du client</Label>
            <Input
              id="clientName"
              value={newAppointment.clientName || ''}
              onChange={(e) => setNewAppointment({ ...newAppointment, clientName: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
            <Input
              id="phoneNumber"
              value={newAppointment.phoneNumber || ''}
              onChange={(e) => setNewAppointment({ ...newAppointment, phoneNumber: e.target.value })}
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
  )
}

