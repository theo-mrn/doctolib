import { Metadata } from "next"
import Dashboard from "@/components/dashboard"

export const metadata: Metadata = {
  title: "Tableau de bord du salon de coiffure",
  description: "Gérez votre salon de coiffure en un coup d'œil",
}

export default function DashboardPage() {
  return <Dashboard />
}

