"use client"

import { useState } from "react"
import { Scissors, Calendar, Clock, MapPin, Trash2, User, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import dayjs from "dayjs"
import { useToast } from "@/hooks/use-toast"
import "dayjs/locale/fr"
import { motion, AnimatePresence } from "framer-motion"

dayjs.locale("fr")

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
  id: number
  full_name: string
  client_id: string
  date: string
  time: string
  duree: number
  salons: {
    nom_salon: string
    adresse: string
  }
}

interface AppointmentListProps {
  appointments: Appointment[]
}

export default function AppointmentList({ appointments: initialAppointments }: AppointmentListProps) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments)
  const { toast } = useToast()
  const [appointmentToDelete, setAppointmentToDelete] = useState<number | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const isPassedAppointment = (date: string, time: string) => {
    const appointmentDate = dayjs(`${date}T${time}`)
    return appointmentDate.isBefore(dayjs())
  }

  const sortedAppointments = {
    upcoming: appointments.filter(app => !isPassedAppointment(app.date, app.time)),
    passed: appointments.filter(app => isPassedAppointment(app.date, app.time))
  }

  const cancelAppointment = async (id: number) => {
    const { error } = await supabase.from("reservations").delete().eq("id", id)

    if (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'annulation du rendez-vous.",
        variant: "destructive",
      })
      console.error("Error deleting appointment:", error.message)
      return
    }

    setAppointments((prevAppointments) => prevAppointments.filter((appointment) => appointment.id !== id))

    toast({
      title: "Rendez-vous annulé",
      description: "Le rendez-vous a bien été annulé.",
    })
    setAppointmentToDelete(null)
  }

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Mes Rendez-vous</h2>
      
      <div className="space-y-6">
        {sortedAppointments.upcoming.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">Rendez-vous à venir</h3>
            <AnimatePresence>
              {sortedAppointments.upcoming.map((appointment) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 mb-4">
                    <CardContent className="p-0">
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => setExpandedId(expandedId === appointment.id ? null : appointment.id)}
                      >
                        <div className="flex items-center gap-6">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5 text-gray-500" />
                            <span className="text-sm font-medium text-gray-900">
                              {dayjs(appointment.date).format("D MMMM")} à {dayjs(`${appointment.date}T${appointment.time}`).format("HH:mm")}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Scissors className="h-5 w-5 text-gray-500" />
                            <span className="text-gray-800">{appointment.salons.nom_salon}</span>
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: expandedId === appointment.id ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </motion.div>
                      </div>
                      <AnimatePresence>
                        {expandedId === appointment.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="p-4 space-y-3 bg-gray-50 border-t border-gray-200">
                              <div className="flex items-center text-sm text-gray-600">
                                <User className="h-4 w-4 mr-3 text-gray-400" />
                                <span>{appointment.full_name}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                                <span>{dayjs(appointment.date).format("dddd D MMMM YYYY")}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="h-4 w-4 mr-3 text-gray-400" />
                                <span>{dayjs(`${appointment.date}T${appointment.time}`).format("HH:mm")}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                                <span>{appointment.salons.adresse}</span>
                              </div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-3 w-full text-gray-600 hover:text-red-600 hover:border-red-300 transition-colors duration-200"
                                    onClick={() => setAppointmentToDelete(appointment.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Annuler le rendez-vous
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                  <DialogHeader>
                                    <DialogTitle>Confirmer l&apos;annulation</DialogTitle>
                                    <DialogDescription>
                                      Êtes-vous sûr de vouloir annuler ce rendez-vous pour {appointment.full_name} ? Cette
                                      action est irréversible.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter className="gap-2 sm:gap-0">
                                    <Button variant="outline" onClick={() => setAppointmentToDelete(null)}>
                                      Annuler
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => appointmentToDelete && cancelAppointment(appointmentToDelete)}
                                    >
                                      Confirmer
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {sortedAppointments.passed.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">Rendez-vous passés</h3>
            <AnimatePresence>
              {sortedAppointments.passed.map((appointment) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden bg-gray-50 border border-gray-200 opacity-75 mb-4">
                    <CardContent className="p-0">
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer"
                        onClick={() => setExpandedId(expandedId === appointment.id ? null : appointment.id)}
                      >
                        <div className="flex items-center gap-6">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <span className="text-sm font-medium text-gray-600">
                              {dayjs(appointment.date).format("D MMMM")} à {dayjs(`${appointment.date}T${appointment.time}`).format("HH:mm")}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Scissors className="h-5 w-5 text-gray-400" />
                            <span className="text-gray-600">{appointment.salons.nom_salon}</span>
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: expandedId === appointment.id ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </motion.div>
                      </div>
                      <AnimatePresence>
                        {expandedId === appointment.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="p-4 space-y-3 bg-gray-50 border-t border-gray-200">
                              <div className="flex items-center text-sm text-gray-600">
                                <User className="h-4 w-4 mr-3 text-gray-400" />
                                <span>{appointment.full_name}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                                <span>{dayjs(appointment.date).format("dddd D MMMM YYYY")}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="h-4 w-4 mr-3 text-gray-400" />
                                <span>{dayjs(`${appointment.date}T${appointment.time}`).format("HH:mm")}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                                <span>{appointment.salons.adresse}</span>
                              </div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-3 w-full text-gray-600 hover:text-red-600 hover:border-red-300 transition-colors duration-200"
                                    onClick={() => setAppointmentToDelete(appointment.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Annuler le rendez-vous
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                  <DialogHeader>
                                    <DialogTitle>Confirmer l&apos;annulation</DialogTitle>
                                    <DialogDescription>
                                      Êtes-vous sûr de vouloir annuler ce rendez-vous pour {appointment.full_name} ? Cette
                                      action est irréversible.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter className="gap-2 sm:gap-0">
                                    <Button variant="outline" onClick={() => setAppointmentToDelete(null)}>
                                      Annuler
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => appointmentToDelete && cancelAppointment(appointmentToDelete)}
                                    >
                                      Confirmer
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

