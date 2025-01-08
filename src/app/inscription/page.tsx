"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; 
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function InscriptionPage() {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            throw new Error("Erreur lors de la sauvegarde de la session.");
          }

          console.log("Session OAuth enregistrée avec succès !");
          router.push("/dashboard");
        } else {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session) {
            console.log("Session existante trouvée :", sessionData.session);
            router.push("/dashboard");
          }
        }
      } catch (error) {
        console.error("Erreur lors de la gestion de la session :", error);
      }
    };

    checkSession();
  }, [router]);

  const handleSignUp = async () => {
    try {
      const { data: userData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        throw new Error(signUpError.message);
      }

      const userId = userData.user?.id;

      if (!userId) {
        throw new Error("Utilisateur non créé correctement.");
      }

      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        prenom,
        nom,
        telephone,
      });

      if (profileError) {
        throw new Error(profileError.message);
      }

      setMessage("Inscription réussie !");
      router.push("/dashboard");
    } catch (error: any) {
      setMessage(`Erreur : ${error.message}`);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "http://localhost:3000/inscription",
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log("Redirection vers Google en cours...");
    } catch (error: any) {
      setMessage(`Erreur avec Google : ${error.message}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Inscription Client</CardTitle>
          <CardDescription>Créez votre compte CoiffureRDV</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSignUp();
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
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full mt-4">
              S'inscrire
            </Button>
          </form>
          <div className="flex flex-col items-center mt-4">
            <Button
              onClick={handleGoogleSignIn}
              className="w-full bg-red-500 hover:bg-red-600"
            >
              S'inscrire / Se connecter avec Google
            </Button>
          </div>
          {message && (
            <p
              className={`mt-4 text-sm text-center ${
                message.includes("Erreur") ? "text-red-600" : "text-green-600"
              }`}
            >
              {message}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="mt-4 text-sm text-center">
            <Link href="/connexion" className="text-blue-600 hover:underline">
              Déjà un compte ? Se connecter
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}