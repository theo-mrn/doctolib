"use client";

import { useState, useEffect } from "react";
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

export default function ConnexionPage() {
  const [identifier, setIdentifier] = useState("");
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
            setMessage("Erreur lors de la sauvegarde de la session.");
            console.error(error);
            return;
          }

          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session) {
            console.log("Session trouvée :", sessionData.session);
            console.log("Access Token (JWT) :", sessionData.session.access_token);
            setMessage("Connexion réussie !");
            router.push("/dashboard");
          }
        } else {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session) {
            console.log("Session existante trouvée :", sessionData.session);
            console.log("Access Token (JWT) :", sessionData.session.access_token);
            setMessage("Connexion réussie !");
            router.push("/dashboard");
          }
        }
      } catch (error) {
        console.error("Erreur inattendue :", error);
        setMessage("Erreur inattendue lors de la récupération des jetons.");
      }
    };

    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: identifier.includes("@") ? identifier : "",
      password,
    });

    if (error) {
      setMessage(`Erreur lors de la connexion : ${error.message}`);
    } else {
      console.log("Connexion réussie, session :", data.session);
      console.log("Access Token (JWT) :", data.session?.access_token);
      setMessage("Connexion réussie !");
      router.push("/dashboard");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "http://localhost:3000/connexion",
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
          <CardTitle>Connexion</CardTitle>
          <CardDescription>
            Connectez-vous à votre compte CoiffureRDV (client ou professionnel)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="identifier">Email ou Téléphone</Label>
                <Input
                  id="identifier"
                  placeholder="votre@email.com ou 0612345678"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full mt-4">
                Se connecter
              </Button>
            </div>
          </form>
          <div className="flex flex-col items-center mt-4">
            <Button
              onClick={handleGoogleSignIn}
              className="w-full bg-red-500 hover:bg-red-600"
            >
              Se connecter avec Google
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
            <Link href="/inscription" className="text-blue-600 hover:underline">
              Pas encore de compte client ? S'inscrire
            </Link>
          </div>
          <div className="mt-2 text-sm text-center">
            <Link href="/mot-de-passe-oublie" className="text-gray-600 hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}