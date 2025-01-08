'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type DeleteConfirmationDialogProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  appointmentDetails: string
}

export function DeleteConfirmationDialog({ isOpen, onClose, onConfirm, appointmentDetails }: DeleteConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer le rendez-vous suivant ?
            <br />
            <strong>{appointmentDetails}</strong>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button variant="destructive" onClick={onConfirm}>Supprimer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

