"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from 'lucide-react'

// Configuration de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Message {
  id: number
  content: string
  sender_id: string
  sender_name: string
  recipient_id: string
  timestamp: string
}

interface MessagerieProps {
  otherPersonName: string
  otherPersonAvatar?: string
  salonId: number
}

export function Messagerie({ otherPersonName, otherPersonAvatar, salonId }: MessagerieProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [recipientId, setRecipientId] = useState<string | null>(null)
  const [salonName, setSalonName] = useState<string>("")


  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUserId(session.user.id)
        setUserName(session.user.user_metadata.full_name || "Utilisateur")
      }
    }
    fetchSession()
  }, [])


  useEffect(() => {
    const fetchRecipientId = async () => {
      const { data, error } = await supabase
        .from('salons')
        .select('professionnel_id, nom_salon')
        .eq('id', salonId)
        .single()

      if (!error && data) {
        setRecipientId(data.professionnel_id)
        setSalonName(data.nom_salon)
      }
    }

    fetchRecipientId()
  }, [salonId])


  useEffect(() => {
    const fetchMessages = async () => {
      if (!userId || !recipientId) return;
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('timestamp', { ascending: true })

      if (!error) setMessages(data || [])
    }

    fetchMessages()
  }, [salonId, userId, recipientId])

  // ✅ Envoyer un message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() === "" || !userId || !recipientId || !userName) return

    const { error } = await supabase
      .from('messages')
      .insert([
        {
          sender_id: userId,
          sender_name: userName,
          recipient_id: recipientId,
          content: newMessage
        }
      ])

    if (!error) {
      setMessages([...messages, { id: Date.now(), content: newMessage, sender_id: userId, sender_name: userName, recipient_id: recipientId, timestamp: new Date().toISOString() }])
      setNewMessage("")
    }
  }

  return (
    <Card className="w-full mx-auto h-full flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <Avatar>
          <AvatarImage src={otherPersonAvatar || "/placeholder.svg"} alt={otherPersonName} />
          <AvatarFallback>{otherPersonName?.charAt(0).toUpperCase() || 'N/A'}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-semibold">{otherPersonName}</h2>
          <p className="text-sm text-muted-foreground">Salon: {salonName}</p>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-4">
        <ScrollArea className="h-full pr-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === userId ? "justify-end" : "justify-start"} mb-4`}
            >
              <div
                className={`rounded-lg p-3 max-w-[70%] ${
                  message.sender_id === userId ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                <p className="font-semibold">{message.sender_name}</p>
                <p>{message.content}</p>
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            placeholder="Tapez votre message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" size="icon" disabled={!userId}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Envoyer</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}