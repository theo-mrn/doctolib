'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Scissors } from 'lucide-react'
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

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (user) {
        setIsLoggedIn(true)
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
    <nav className="bg-white shadow-md z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 z-50">
        <div className="flex justify-between h-16 z-50 hover:z-50">
          <div className="flex">
            <Link href="/dashboard" className="flex-shrink-0 flex items-center">
              <Scissors className="h-8 w-8 text-indigo-600" />
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
                    <NavigationMenuTrigger>J'ai un salon</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] z-50 hover:z-50">
                        <li className="row-span-3">
                          <NavigationMenuLink asChild>
                            <a
                              className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-indigo-500 to-indigo-900 p-6 no-underline outline-none focus:shadow-md hover:z-50"
                              href="/inscription-salon"
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
                              href="/appointments"
                            >
                              <div className="text-sm font-medium leading-none">Mes rendez-vous</div>
                              <p className="line-clamp-2 text-sm leading-snug text-gray-500">
                                Gérez vos rendez-vous.
                              </p>
                            </a>
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink asChild>
                            <a
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100"
                              href="/messagerie"
                            >
                              <div className="text-sm font-medium leading-none">Mes messages</div>
                              <p className="line-clamp-2 text-sm leading-snug text-gray-500">
                                Gérez vos messages
                              </p>
                            </a>
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink asChild>
                            <a
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100"
                              href="/gestion-salon"
                            >
                              <div className="text-sm font-medium leading-none">Gestion de salon</div>
                              <p className="line-clamp-2 text-sm leading-snug text-gray-500">
                                Gérez votre équipe et vos services.
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
              <Button 
                variant="outline" 
                onClick={handleLogout}
              >
                Déconnexion
              </Button>
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

