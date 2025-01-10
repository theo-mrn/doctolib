"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"

// Fonction pour obtenir le numéro de la semaine
Date.prototype.getWeek = function () {
  const firstDayOfYear = new Date(this.getFullYear(), 0, 1)
  const pastDaysOfYear = (this - firstDayOfYear) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

// Fonction pour générer les jours d'un mois
const generateMonthDays = (year: number, month: number) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = []
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i).toLocaleString('fr-FR', { day: 'numeric', month: 'short' }))
  }
  return days
}

// Fonction pour générer les jours d'une semaine
const generateWeekDays = (year: number, week: number) => {
  const firstDayOfYear = new Date(year, 0, 1)
  const days = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(firstDayOfYear.getTime() + ((week - 1) * 7 + i) * 86400000)
    days.push(day.toLocaleString('fr-FR', { weekday: 'long' }))
  }
  return days
}

export function RevenueOverview() {
  const [data, setData] = useState<{ name: string; total: number }[]>([])
  const [weeklyData, setWeeklyData] = useState<{ day: string; total: number }[]>([])
  const [monthlyData, setMonthlyData] = useState<{ month: string; total: number }[]>([])
  const [payments, setPayments] = useState<{ id: string; client: string; service: string; amount: number; date: string }[]>([])
  const [salonId, setSalonId] = useState<number | null>(null)
  const [duration, setDuration] = useState<string>('weekly')
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null)

  useEffect(() => {
    const fetchSalonId = async () => {
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
      } else {
        setSalonId(profile.salon)
      }
    }

    fetchSalonId()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      if (!salonId) return

      const { data: reservations, error } = await supabase
        .from('reservations')
        .select('id, full_name, service, price, date')
        .eq('salon_id', salonId)
        .order('date', { ascending: true }) // Tri par date

      if (error) {
        console.error('❌ Erreur lors de la récupération des réservations :', error.message)
      } else {
        const now = new Date()
        const pastReservations = reservations.filter((reservation: any) => new Date(reservation.date) < now)
        
        const formattedData = pastReservations.reduce((acc: any, reservation: any) => {
          const day = new Date(reservation.date).toLocaleString('fr-FR', { day: 'numeric', month: 'short' })
          const existingDay = acc.find((item: any) => item.name === day)
          if (existingDay) {
            existingDay.total += reservation.price
          } else {
            acc.push({ name: day, total: reservation.price })
          }
          return acc
        }, [])

        const weeklyData = pastReservations.reduce((acc: any, reservation: any) => {
          const week = `Semaine ${new Date(reservation.date).getWeek()}`
          const existingWeek = acc.find((item: any) => item.week === week)
          if (existingWeek) {
            existingWeek.total += reservation.price
          } else {
            acc.push({ week, total: reservation.price })
          }
          return acc
        }, [])

        const monthlyData = pastReservations.reduce((acc: any, reservation: any) => {
          const month = new Date(reservation.date).toLocaleString('fr-FR', { month: 'long', year: 'numeric' })
          const existingMonth = acc.find((item: any) => item.month === month)
          if (existingMonth) {
            existingMonth.total += reservation.price
          } else {
            acc.push({ month, total: reservation.price })
          }
          return acc
        }, [])

        setData(formattedData)
        setWeeklyData(weeklyData)
        setMonthlyData(monthlyData)
        setPayments(pastReservations.map((reservation: any) => ({
          id: reservation.id,
          client: reservation.full_name,
          service: reservation.service,
          amount: reservation.price,
          date: reservation.date,
        })))
      }
    }

    fetchData()
  }, [salonId, duration, selectedMonth, selectedWeek])

  useEffect(() => {
    if (duration === 'monthly' && selectedMonth) {
      const [monthName, year] = selectedMonth.split(' ')
      const month = new Date(Date.parse(monthName + " 1, " + year)).getMonth()
      const days = generateMonthDays(parseInt(year), month)
      const newData = days.map(day => {
        const existingDay = data.find(d => d.name === day)
        return existingDay ? existingDay : { name: day, total: 0 }
      })
      setData(newData)
    } else if (duration === 'weekly' && selectedWeek) {
      const [_, weekNumber] = selectedWeek.split(' ')
      const year = new Date().getFullYear()
      const days = generateWeekDays(year, parseInt(weekNumber))
      const newData = days.map(day => {
        const existingDay = data.find(d => d.name === day)
        return existingDay ? existingDay : { name: day, total: 0 }
      })
      setData(newData)
    }
  }, [duration, selectedMonth, selectedWeek])

  const totalRevenue = data.reduce((acc, item) => acc + item.total, 0)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Aperçu des revenus</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="graph" className="space-y-4">
          <TabsList>
            <TabsTrigger value="graph">Graphique</TabsTrigger>
            <TabsTrigger value="lineGraph">Graphique en ligne</TabsTrigger>
            <TabsTrigger value="payments">Paiements</TabsTrigger>
          </TabsList>
          <div className="flex justify-end space-x-4">
            <Select onValueChange={(value) => setDuration(value)} defaultValue="weekly">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sélectionner la durée" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Hebdomadaire</SelectItem>
                <SelectItem value="monthly">Mensuel</SelectItem>
              </SelectContent>
            </Select>
            {duration === 'monthly' && (
              <Select onValueChange={(value) => setSelectedMonth(value)} defaultValue={null}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sélectionner le mois" />
                </SelectTrigger>
                <SelectContent>
                  {monthlyData.map((item) => (
                    <SelectItem key={item.month} value={item.month}>{item.month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {duration === 'weekly' && (
              <Select onValueChange={(value) => setSelectedWeek(value)} defaultValue={null}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sélectionner la semaine" />
                </SelectTrigger>
                <SelectContent>
                  {weeklyData.map((item) => (
                    <SelectItem key={item.week} value={item.week}>{item.week}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <TabsContent value="graph" className="space-y-4">
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalRevenue)}
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}€`}
                  />
                  <Bar 
                    dataKey="total" 
                    fill="currentColor" 
                    radius={[4, 4, 0, 0]} 
                    className="fill-primary"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="lineGraph" className="space-y-4">
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalRevenue)}
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}€`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="currentColor" 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                    activeDot={{ r: 6 }} 
                    className="stroke-primary"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="payments">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.client}</TableCell>
                    <TableCell>{payment.service}</TableCell>
                    <TableCell>{new Date(payment.date).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>{payment.amount}€</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

