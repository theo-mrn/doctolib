"use client"
import MonCompteForm from "./mon-compte-form"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"

export default function MonComptePage() {
  const [user, setUser] = useState<User | null>(null)
  const [prenom, setPrenom] = useState("")
  const [nom, setNom] = useState("")
  const [email, setEmail] = useState("")
  const [telephone, setTelephone] = useState("")
  const [message, setMessage] = useState("")
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)


  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
        if (profile) {
          setPrenom(profile.prenom || "")
          setNom(profile.nom || "")
          setEmail(user.email || "")
          setTelephone(profile.telephone || "")
        }
      }
    }
    fetchUserData()
  }, [])

  const handleUpdate = async () => {
    if (!user) return

    try {
      const { error: updateUserError } = await supabase.auth.updateUser({
        email,
      })

      if (updateUserError) {
        throw new Error(updateUserError.message)
      }

      const { error: updateProfileError } = await supabase
        .from("profiles")
        .update({
          prenom,
          nom,
          telephone,
        })
        .eq("id", user.id)

      if (updateProfileError) {
        throw new Error(updateProfileError.message)
      }

      if (isChangingPassword) {
        const { error: updatePasswordError } = await supabase.auth.updateUser({
          password: newPassword,
        })

        if (updatePasswordError) {
          throw new Error(updatePasswordError.message)
        }
      }

      setMessage("Mise à jour réussie !")
    } catch (error: unknown) {
      setMessage(`Erreur : ${(error as Error).message}`)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Mon Compte</h1>
      <MonCompteForm
        prenom={prenom}
        nom={nom}
        email={email}
        telephone={telephone}
        setPrenom={setPrenom}
        setNom={setNom}
        setEmail={setEmail}
        setTelephone={setTelephone}
        handleUpdate={handleUpdate}
        message={message}
        oldPassword={oldPassword}
        setOldPassword={setOldPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        isChangingPassword={isChangingPassword}
        setIsChangingPassword={setIsChangingPassword}
      />
    </div>
  )
}
