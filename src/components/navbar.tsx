"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Scissors, User, Calendar, ChevronDown, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInitials, setUserInitials] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setIsLoggedIn(true)
        const initials = user.email ? user.email.substring(0, 2).toUpperCase() : "U"
        setUserInitials(initials)
      } else {
        setIsLoggedIn(false)
      }
    }

    checkUser()
  }, [])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("❌ Erreur lors de la déconnexion:", error.message)
    } else {
      setIsLoggedIn(false)
      router.push("/connexion")
    }
  }

  return (
    <nav className="bg-zinc-900">
      <div className="flex justify-between items-center h-16 px-4 md:px-6 relative">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/recherche" className="flex items-center">
            <Scissors className="h-6 w-6 text-zinc-100" />
            <span className="ml-2 text-2xl font-semibold text-zinc-100">MonSalon</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-zinc-100"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 justify-center items-center">
          <div className="flex items-center space-x-6">
            <Link 
              href="/recherche?type=coiffeur" 
              className="text-base font-bold text-zinc-100 hover:text-black hover:bg-white transition-colors px-3 py-1.5 rounded text-center"
            >
              Coiffeur
            </Link>
            <Link 
              href="/recherche?type=barbier" 
              className="text-base font-bold text-zinc-100 hover:text-black hover:bg-white transition-colors px-3 py-1.5 rounded text-center"
            >
              Barbier
            </Link>
            <Link 
              href="/recherche?type=manucure" 
              className="text-base font-bold text-zinc-100 hover:text-black hover:bg-white transition-colors px-3 py-1.5 rounded text-center"
            >
              Manucure
            </Link>
          </div>
        </div>

        {/* Desktop User Actions */}
        <div className="hidden md:flex items-center space-x-2">
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-zinc-100 text-base font-bold bg-transparent px-4 py-2">
                  J&apos;ai un salon
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 bg-zinc-900 border-zinc-800 text-zinc-100 p-2" align="end">
                <DropdownMenuItem
                  onClick={() => router.push("/register-salon")}
                  className="focus:bg-white focus:text-black p-4"
                >
                  <div>
                    <div className="font-medium text-base">Inscrivez votre salon</div>
                    <p className="text-sm text-zinc-400 mt-2">Rejoignez notre plateforme</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/monsalon")}
                  className="hover:bg-white hover:text-black focus:bg-white focus:text-black p-4"
                >
                  <div>
                    <div className="font-medium text-base">Mon salon</div>
                    <p className="text-sm text-zinc-400 mt-2">Gérez votre établissement</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/modifier-salon")}
                  className="hover:bg-white hover:text-black focus:bg-white focus:text-black p-4"
                >
                  <div>
                    <div className="font-medium text-base">Modifier mon salon</div>
                    <p className="text-sm text-zinc-400 mt-2">Mettez à jour vos informations</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              href="/reservations"
              className="flex items-center text-base font-bold text-zinc-100 hover:text-black hover:bg-white transition-colors px-3 py-1.5 rounded"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Mes rendez-vous
            </Link>

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatars/01.png" alt="@username" />
                      <AvatarFallback className="bg-zinc-800 text-zinc-100">{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-zinc-900 border-zinc-800 text-zinc-100 p-2" align="end" forceMount>
                  <DropdownMenuItem
                    onClick={() => router.push("/moncompte")}
                    className="hover:bg-white hover:text-black focus:bg-white focus:text-black p-4"
                  >
                    <User className="mr-3 h-5 w-5" />
                    <span className="text-base">Mon compte</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="hover:bg-white hover:text-black focus:bg-white focus:text-black p-4"
                  >
                    <span className="text-base">Se déconnecter</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="text-zinc-800 text-base font-bold border-zinc-700 hover:bg-white hover:text-black px-6 py-2"
                  onClick={() => router.push("/connexion")}
                >
                  Se connecter
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-zinc-900 p-4 md:hidden border-t border-zinc-800">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/recherche?type=coiffeur" 
                className="text-base font-bold text-zinc-100 hover:text-black hover:bg-white transition-colors px-3 py-2 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                Coiffeur
              </Link>
              <Link 
                href="/recherche?type=barbier" 
                className="text-base font-bold text-zinc-100 hover:text-black hover:bg-white transition-colors px-3 py-2 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                Barbier
              </Link>
              <Link 
                href="/recherche?type=manucure" 
                className="text-base font-bold text-zinc-100 hover:text-black hover:bg-white transition-colors px-3 py-2 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                Manucure
              </Link>

              <div className="border-t border-zinc-800 my-2"></div>

              <Link
                href="/reservations"
                className="flex items-center text-base font-bold text-zinc-100 hover:text-black hover:bg-white transition-colors px-3 py-2 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Mes rendez-vous
              </Link>

              {isLoggedIn ? (
                <>
                  <Link
                    href="/moncompte"
                    className="flex items-center text-base font-bold text-zinc-100 hover:text-black hover:bg-white transition-colors px-3 py-2 rounded"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Mon compte
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-left text-base font-bold text-zinc-100 hover:text-black hover:bg-white transition-colors px-3 py-2 rounded w-full"
                  >
                    Se déconnecter
                  </button>
                </>
              ) : (
                <Button
                  variant="outline"
                  className="text-zinc-100 text-base font-bold border-zinc-700 hover:bg-white hover:text-black w-full"
                  onClick={() => {
                    router.push("/connexion");
                    setIsMenuOpen(false);
                  }}
                >
                  Se connecter
                </Button>
              )}

              <div className="border-t border-zinc-800 my-2"></div>

              <Link
                href="/register-salon"
                className="text-base font-bold text-zinc-100 hover:text-black hover:bg-white transition-colors px-3 py-2 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                Inscrivez votre salon
              </Link>
              <Link
                href="/monsalon"
                className="text-base font-bold text-zinc-100 hover:text-black hover:bg-white transition-colors px-3 py-2 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                Mon salon
              </Link>
              <Link
                href="/modifier-salon"
                className="text-base font-bold text-zinc-100 hover:text-black hover:bg-white transition-colors px-3 py-2 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                Modifier mon salon
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

