"use client"

import React, { useEffect, useState } from "react"
import { DateRange as DayPickerDateRange } from "react-day-picker"
import { format } from "date-fns"
import { fr } from 'date-fns/locale'
import { CalendarIcon, MessageSquare, PieChart } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker"
import { Overview } from "@/components/overview"
import { UpcomingAppointments } from "@/components/upcoming-appointments"
import { supabase } from "@/lib/supabase"
import { AppointmentCalendar } from "@/components/appointment-calendar"
import { MessageList } from "@/components/message-list"

export default function DashboardPage() {
  const [dateRange, setDateRange] = React.useState<DayPickerDateRange | undefined>({
    from: new Date(),
    to: new Date(),
  })
  const [revenue, setRevenue] = useState("0.00")
  const [clients, setClients] = useState(0)
  const [activeTab, setActiveTab] = useState<"finance"|"messages"|"rdv">("finance")

  useEffect(() => {
    const calculateRevenue = async (range: DayPickerDateRange | undefined) => {
      if (!range || !range.from || !range.to) return "0.00"
      const { data: reservations, error } = await supabase
        .from('reservations')
        .select('price')
        .gte('date', range.from.toISOString())
        .lte('date', range.to.toISOString())

      if (error) {
        console.error('Erreur lors de la récupération des revenus:', error.message)
        return "0.00"
      }

      if (!reservations) return "0.00"

      const totalRevenue = (reservations as { price: number }[]).reduce(
        (acc, reservation) => acc + reservation.price,
        0
      )
      return totalRevenue.toFixed(2)
    }

    const calculateClients = async (range: DayPickerDateRange | undefined) => {
      if (!range || !range.from || !range.to) return 0
      const { data: reservations, error } = await supabase
        .from('reservations')
        .select('id')
        .gte('date', range.from.toISOString())
        .lte('date', range.to.toISOString())

      if (error) {
        console.error('Erreur lors de la récupération des rendez-vous:', error.message)
        return 0
      }

      return reservations.length
    }

    const fetchData = async () => {
      const revenue = await calculateRevenue(dateRange)
      const clients = await calculateClients(dateRange)
      setRevenue(revenue)
      setClients(clients)
    }

    fetchData()
  }, [dateRange])

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 border-r bg-muted/40 flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-semibold">Salon de Coiffure</h1>
        </div>
        <nav className="flex flex-col space-y-1 px-3 py-2">
          <button
            onClick={() => setActiveTab("finance")}
            className={`flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm ${
              activeTab === "finance"
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-secondary/50"
            }`}
          >
            <PieChart className="h-4 w-4" />
            <span>Financier</span>
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm ${
              activeTab === "messages"
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-secondary/50"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Messages</span>
          </button>
          <button
            onClick={() => setActiveTab("rdv")}
            className={`flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm ${
              activeTab === "rdv"
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-secondary/50"
            }`}
          >
            <CalendarIcon className="h-4 w-4" />
            <span>Rendez-vous</span>
          </button>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        {activeTab === "finance" && (
          <div>
            <div className="flex-1 space-y-4 p-8 pt-6">
              <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
                <div className="flex items-center space-x-2">
                  <CalendarDateRangePicker date={dateRange} setDate={setDateRange} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Revenus de la période
                    </CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <path d="M2 10h20" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{revenue} €</div>
                    <p className="text-xs text-muted-foreground">
                      {dateRange?.from && dateRange?.to ? (
                        `Pour la période du ${format(dateRange.from, 'dd MMMM yyyy', { locale: fr })} au ${format(dateRange.to, 'dd MMMM yyyy', { locale: fr })}`
                      ) : (
                        "Veuillez sélectionner une période"
                      )}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Nombre de clients
                    </CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M16 3h5v5M8 3H3v5M21 21h-5v-5M3 21h5v-5" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{clients}</div>
                    <p className="text-xs text-muted-foreground">
                      {dateRange?.from && dateRange?.to ? (
                        `Pour la période du ${format(dateRange.from, 'dd MMMM yyyy', { locale: fr })} au ${format(dateRange.to, 'dd MMMM yyyy', { locale: fr })}`
                      ) : (
                        "Veuillez sélectionner une période"
                      )}
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Aperçu des revenus</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    {dateRange && dateRange.from && dateRange.to ? (
                      <Overview dateRange={{ from: dateRange.from, to: dateRange.to }} />
                    ) : (
                      <p>Veuillez sélectionner une période valide</p>
                    )}
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Rendez-vous</CardTitle>
                    <CardDescription>
                      Liste des rendez-vous pour la période sélectionnée
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dateRange && dateRange.from && dateRange.to ? (
                      <UpcomingAppointments dateRange={{ from: dateRange.from, to: dateRange.to }} />
                    ) : (
                      <p>Veuillez sélectionner une période valide</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
        {activeTab === "messages" && (
          <MessageList />
        )}
        {activeTab === "rdv" && (
          <AppointmentCalendar />
        )}
      </main>
    </div>
  )
}

