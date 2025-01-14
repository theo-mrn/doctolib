"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"

interface MonCompteFormProps {
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  setPrenom: (value: string) => void;
  setNom: (value: string) => void;
  setEmail: (value: string) => void;
  setTelephone: (value: string) => void;
  handleUpdate: () => void;
  message?: string;
  oldPassword: string;
  setOldPassword: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  isChangingPassword: boolean;
  setIsChangingPassword: (value: boolean) => void;
}

export default function MonCompteForm({
  prenom,
  nom,
  email,
  telephone,
  setPrenom,
  setNom,
  setEmail,
  setTelephone,
  handleUpdate,
  message,
  oldPassword,
  setOldPassword,
  newPassword,
  setNewPassword,
  isChangingPassword,
  setIsChangingPassword,
}: MonCompteFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleUpdate()
      }}
    >
      <div className="grid w-full items-center gap-4">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="prenom">Prénom</Label>
          <Input
            id="prenom"
            placeholder="Jean"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="nom">Nom</Label>
          <Input
            id="nom"
            placeholder="Dupont"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            placeholder="jean.dupont@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="telephone">Téléphone</Label>
          <Input
            id="telephone"
            placeholder="06 12 34 56 78"
            type="tel"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            required
          />
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4">Mot de passe</h2>
        {!isChangingPassword ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsChangingPassword(true)}
          >
            Changer le mot de passe
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="oldPassword">Ancien mot de passe</Label>
              <Input
                id="oldPassword"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="confirmNewPassword">Confirmer le nouveau mot de passe</Label>
              <Input
                id="confirmNewPassword"
                type="password"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsChangingPassword(false)}
            >
              Annuler
            </Button>
          </div>
        )}
      </div>

      <Button type="submit" className="w-full mt-4">
        Mettre à jour
      </Button>
      {message && (
        <p
          className={`mt-4 text-sm text-center ${
            message.includes("Erreur") ? "text-red-600" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  )
}

