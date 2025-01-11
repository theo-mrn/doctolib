"use client"

import React, { useEffect, useState } from "react"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"

interface DateRange {
  from: Date;
  to: Date;
}

interface OverviewProps {
  dateRange: DateRange | undefined
}

interface Reservation {
  date: string;
  price: number;
}

export function Overview({ dateRange }: OverviewProps) {
  const [data, setData] = useState<{ name: string; total: number }[]>([])

  useEffect(() => {
    const fetchData = async () => {
      if (!dateRange?.from || !dateRange?.to) return

      const { data: reservations, error } = await supabase
        .from('reservations')
        .select('*')
        .gte('date', dateRange.from.toISOString())
        .lte('date', dateRange.to.toISOString())

      if (error) {
        console.error('Erreur lors de la récupération des revenus:', error.message)
      } else {
        const sortedReservations = reservations.sort((a: Reservation, b: Reservation) => new Date(a.date).getTime() - new Date(b.date).getTime())
        const formattedData = sortedReservations.map((reservation: Reservation) => ({
          name: format(parseISO(reservation.date), 'dd/MM', { locale: fr }),
          total: reservation.price
        }))
        setData(formattedData)
      }
    }
    fetchData()
  }, [dateRange])

  if (!dateRange?.from || !dateRange?.to) {
    return <p>Veuillez sélectionner une période pour voir l&apos;aperçu des revenus.</p>
  }

  return (
    <>
      <CardTitle>Aperçu des revenus pour la période sélectionnée</CardTitle>
      <Tabs defaultValue="barChart" className="space-y-4">
        <TabsList>
          <TabsTrigger value="barChart">Graphique en barres</TabsTrigger>
          <TabsTrigger value="lineChart">Graphique en ligne</TabsTrigger>
        </TabsList>
        <TabsContent value="barChart" className="space-y-4">
          <ResponsiveContainer width="100%" height={350}>
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
                tickFormatter={(value) => `${value} €`}
              />
              <Tooltip
                formatter={(value: number) => [`${value} €`, "Revenus"]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>
        <TabsContent value="lineChart" className="space-y-4">
          <ResponsiveContainer width="100%" height={350}>
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
                tickFormatter={(value) => `${value} €`}
              />
              <Tooltip
                formatter={(value: number) => [`${value} €`, "Revenus"]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </>
  )
}

