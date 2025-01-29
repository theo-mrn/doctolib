"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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
  salon_id: number
  timestamp: string
  receiver_id: string // Ajout de receiver_id qui manquait dans l'interface
}

// Type pour la création d'un nouveau message
type NewMessage = Omit<Message, 'id'>

interface Conversation {
  id: string
  clientName: string
  avatar: string
  messages: Message[]
  clientId: string
}

interface MessageListProps {
  salonId: number;
}

export function MessageList({ salonId }: MessageListProps) {
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
            .eq('id', salonId)
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
  }, [salonId])

  const fetchConversations = useCallback(async () => {
    if (!userId || !salonId) return;
  
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('salon_id', salonId)
      .order('timestamp', { ascending: true });
  
    if (error) {
      console.error("Erreur de récupération des messages", error);
      return;
    }
  
    const convMap: { [key: string]: Conversation } = {};
  
    messages.forEach(message => {
      const isSentByUser = message.sender_id === userId;
      const isReceivedByUser = message.receiver_id === userId;
  
      if (isSentByUser || isReceivedByUser) {
        const conversationKey = isSentByUser ? message.receiver_id : message.sender_id;
  
        if (!convMap[conversationKey]) {
          convMap[conversationKey] = {
            id: conversationKey,
            clientName: isSentByUser ? "Vous" : message.sender_name,
            avatar: "/placeholder.svg",
            messages: [],
            clientId: conversationKey
          };
        }
  
        convMap[conversationKey].messages.push(message);
      }
    });
  
    setConversations(Object.values(convMap));
    setSelectedContact((prev) => {
      if (!prev) return prev;
      const updatedSelectedContact = Object.values(convMap).find(conv => conv.id === prev.id);
      return updatedSelectedContact || prev;
    });
  }, [userId, salonId]);

    
  useEffect(() => {
    fetchConversations()
    const interval = setInterval(fetchConversations, 5000) 
    return () => clearInterval(interval)
  }, [userId, fetchConversations])

  const handleSend = async () => {
    if (!newMessage.trim() || !userId || !selectedContact) return;
  
    const messageToSend: NewMessage = {
      sender_id: userId,
      receiver_id: selectedContact.clientId,
      sender_name: userName!,
      salon_id: salonId,
      content: newMessage,
      timestamp: new Date().toISOString()
    };
  
    const { data, error } = await supabase
      .from('messages')
      .insert([messageToSend])
      .select()
      .single();
  
    if (error) {
      console.error("❌ Erreur lors de l'envoi :", error);
    } else {
      setSelectedContact(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...prev.messages, data]
        };
      });
      setNewMessage("");
    }
  };

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
              {selectedContact.messages.map((message, index) => (
                <div
                  key={`${message.id}-${index}`} // Ajout d'une clé unique
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

