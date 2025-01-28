'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Scissors, User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useRouter } from 'next/navigation'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInitials, setUserInitials] = useState('')
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setIsLoggedIn(true)
        const initials = user.email ? user.email.substring(0, 2).toUpperCase() : 'U'
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
      console.error('❌ Erreur lors de la déconnexion:', error.message)
    } else {
      setIsLoggedIn(false)
      router.push('/connexion') 
    }
  }

  return (
    <nav className="bg-white  z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 z-50">
        <div className="flex justify-between h-16 z-50 hover:z-50">
          <div className="flex">
            <Link href="/recherche" className="flex-shrink-0 flex items-center">
              <Scissors className="h-8 w-8 text-[#8B4513]" />
              <span className="ml-2 text-xl font-bold text-gray-900">MonSalon</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuLink 
                      href="/reservations"
                      className="text-gray-900 hover:bg-gray-50 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Mes réservations
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>J&apos;ai un salon</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] z-50 hover:z-50">
                        <li className="row-span-3">
                          <NavigationMenuLink asChild>
                            <a
                              className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-black to-[#8B4513] p-6 no-underline outline-none focus:shadow-md hover:z-50"
                              href="/register-salon"
                            >
                              <div className="mt-4 mb-2 text-lg font-medium text-white">
                                Inscrivez votre salon
                              </div>
                              <p className="text-sm leading-tight text-white/90">
                                Rejoignez notre plateforme et développez votre clientèle.
                              </p>
                            </a>
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink asChild>
                            <a
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100"
                              href="/monsalon"
                            >
                              <div className="text-sm font-medium leading-none">Mon salon</div>
                              <p className="line-clamp-2 text-sm leading-snug text-gray-500">
                                Gérez votre salon.
                              </p>
                            </a>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatars/01.png" alt="@username" />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem onClick={() => router.push('/moncompte')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Mon compte</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="space-x-4">
                <Button variant="outline" onClick={() => router.push('/connexion')}>
                  Connexion
                </Button>
                <Button onClick={() => router.push('/inscription')}>
                  Inscription
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

