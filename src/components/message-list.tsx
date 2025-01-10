"use client"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from 'lucide-react'
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

interface Message {
  id: number
  content: string
  sender_id: string
  sender_name: string
  recipient_id: string
  timestamp: string
}

interface Conversation {
  id: string
  clientName: string
  avatar: string
  messages: Message[]
  clientId: string
}

export function MessageList() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedContact, setSelectedContact] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUserId(session.user.id)
        const professionnelId = session.user.id
        if (professionnelId) {
          const { data: salon, error } = await supabase
            .from('salons')
            .select('nom_salon')
            .eq('professionnel_id', professionnelId)
            .single()
          if (error) {
            console.error("Erreur de récupération du nom du salon", error)
            setUserName("Professionnel")
          } else {
            setUserName(salon.nom_salon || "Professionnel")
          }
        } else {
          setUserName("Professionnel")
        }
      }
    }
    fetchSession()
  }, [])

  const fetchConversations = async () => {
    if (!userId) return

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('timestamp', { ascending: true })

    if (error) {
      console.error("Erreur de récupération des messages", error)
      return
    }

    const convMap: { [key: string]: Conversation } = {}

    messages.forEach(message => {
      const conversationKey = message.sender_id === userId
        ? message.recipient_id
        : message.sender_id

      if (!convMap[conversationKey]) {
        convMap[conversationKey] = {
          id: conversationKey,
          clientName: message.sender_id === userId ? "Vous" : message.sender_name,
          avatar: "/placeholder.svg",
          messages: [],
          clientId: conversationKey
        }
      }
      convMap[conversationKey].messages.push(message)
    })

    setConversations(Object.values(convMap))
    if (selectedContact) {
      const updatedSelectedContact = Object.values(convMap).find(conv => conv.id === selectedContact.id)
      setSelectedContact(updatedSelectedContact || selectedContact)
    }
  }

  useEffect(() => {
    fetchConversations()
    const interval = setInterval(fetchConversations, 5000) 
    return () => clearInterval(interval)
  }, [userId])

  const handleSend = async () => {
    if (!newMessage.trim() || !userId || !selectedContact) return

    const messageToSend = {
      sender_id: userId,
      sender_name: userName!,
      recipient_id: selectedContact.clientId,
      content: newMessage,
      timestamp: new Date().toISOString()
    }

    const { error } = await supabase
      .from('messages')
      .insert([messageToSend])

    if (error) {
      console.error("❌ Erreur lors de l'envoi :", error)
    } else {
      fetchConversations()
      setNewMessage("")
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
        }
      }, 100)
    }
  }

  if (selectedContact) {
    return (
      <Card className="h-[90%] flex flex-col">
        <CardHeader className="flex-none">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setSelectedContact(null)}
            >
              ←
            </Button>
            <Avatar>
              <AvatarImage src={selectedContact.avatar} />
              <AvatarFallback>{selectedContact.clientName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <CardTitle>{selectedContact.clientName}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {selectedContact.messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "max-w-[70%] rounded-lg p-4",
                    message.sender_id === userId
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="mt-1 text-xs opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex items-center space-x-2 pt-4">
            <Input
              placeholder="Écrivez votre message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button size="icon" onClick={handleSend}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-[90%]">
      <CardHeader>
        <CardTitle>Messages récents</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[450px] pr-4">
          <div className="space-y-4">
            {conversations.map((contact) => (
              <button
                key={contact.id}
                className="w-full text-left"
                onClick={() => setSelectedContact(contact)}
              >
                <div className="flex space-x-4 rounded-lg border p-4 hover:bg-accent">
                  <Avatar>
                    <AvatarImage src={contact.avatar} />
                    <AvatarFallback>{contact.clientName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{contact.clientName}</p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(contact.messages[contact.messages.length - 1].timestamp).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {contact.messages[contact.messages.length - 1].content}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

