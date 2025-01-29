"use client"

import { useState } from "react"
import { CalendarIcon, MessageSquare, PieChart } from 'lucide-react'
import { AppointmentCalendar } from "./appointment-calendar"
import { MessageList } from "./message-list"
import { RevenueOverview } from "./revenue-overview"

interface DashboardProps {
  salonId: number;
}

export default function Dashboard({ salonId }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("revenue")

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/40">
        <div className="flex h-full flex-col">
          <div className="p-6">
            <h1 className="text-xl font-semibold">Salon de Coiffure</h1>
          </div>
          <nav className="flex-1 space-y-1 px-3">
            <button
              onClick={() => setActiveTab("revenue")}
              className={`flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm ${
                activeTab === "revenue"
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-secondary/50"
              }`}
            >
              <PieChart className="h-4 w-4" />
              <span>Revenus</span>
            </button>
            <button
              onClick={() => setActiveTab("appointments")}
              className={`flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm ${
                activeTab === "appointments"
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-secondary/50"
              }`}
            >
              <CalendarIcon className="h-4 w-4" />
              <span>Rendez-vous</span>
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
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="h-full p-8 overflow-auto">
          {activeTab === "revenue" && (
            <div className="h-full">
              <RevenueOverview />
            </div>
          )}
          {activeTab === "appointments" && (
            <div className="h-full">
              <AppointmentCalendar salonId={salonId} />
            </div>
          )}
          {activeTab === "messages" && (
            <div className="h-full">
              <MessageList salonId={salonId} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

