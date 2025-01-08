"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Menu } from 'lucide-react'

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

export default function Messagerie() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [activeConversation, setActiveConversation] = useState<string | null>(null)
    const [newMessage, setNewMessage] = useState("")
    const [showConversations, setShowConversations] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)
    const [userName, setUserName] = useState<string | null>(null)

    //  Récupérer l'utilisateur et ses salons depuis `profiles`
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

    // Charger toutes les conversations (messages où l'utilisateur est expéditeur ou destinataire)
    useEffect(() => {
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

            // Créer les conversations en regroupant par destinataire/expéditeur
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
            setActiveConversation(Object.values(convMap)[0]?.id || null)
        }

        fetchConversations()
    }, [userId])

    //  Envoyer un message
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newMessage.trim() === "" || !userId || !activeConversation) return

        const activeConv = conversations.find(conv => conv.id === activeConversation)
        if (!activeConv) return

        const messageToSend = {
            sender_id: userId,
            sender_name: userName!,
            recipient_id: activeConv.clientId,
            content: newMessage
        }

        console.log("🔎 Données prêtes à être envoyées :", messageToSend)

        const { error } = await supabase
            .from('messages')
            .insert([messageToSend])

        if (error) {
            console.error("❌ Erreur lors de l'envoi :", error)
        } else {
            setConversations(conversations.map(conv =>
                conv.id === activeConversation
                    ? { ...conv, messages: [...conv.messages, { ...messageToSend, id: Date.now(), timestamp: new Date().toISOString() }] }
                    : conv
            ))
            setNewMessage("")
        }
    }

    const activeConv = conversations.find(c => c.id === activeConversation)

    return (
        <div className="flex h-screen">
            {/*  Liste des conversations */}
            <Card className={`w-64 ${showConversations ? 'block' : 'hidden'} md:block border-r`}>
                <CardHeader className="p-4">
                    <h2 className="text-lg font-semibold">Conversations</h2>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[calc(100vh-8rem)]">
                        {conversations.map((conv) => (
                            <Button
                                key={conv.id}
                                variant="ghost"
                                className="w-full justify-start px-4 py-2 hover:bg-accent"
                                onClick={() => {
                                    setActiveConversation(conv.id)
                                    setShowConversations(false)
                                }}
                            >
                                <Avatar className="w-8 h-8 mr-2">
                                    <AvatarImage src={conv.avatar} alt={conv.clientName} />
                                    <AvatarFallback>{conv.clientName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{conv.clientName}</span>
                            </Button>
                        ))}
                    </ScrollArea>
                </CardContent>
            </Card>

            {/*  Section de messagerie */}
            <Card className="flex-grow flex flex-col h-full">
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setShowConversations(!showConversations)}>
                        <Menu className="h-6 w-6" />
                    </Button>
                    {activeConv && (
                        <>
                            <Avatar>
                                <AvatarImage src={activeConv.avatar} alt={activeConv.clientName} />
                                <AvatarFallback>{activeConv.clientName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow">
                                <h2 className="text-lg font-semibold truncate">{activeConv.clientName}</h2>
                            </div>
                        </>
                    )}
                </CardHeader>
                <CardContent className="flex-grow overflow-hidden p-4">
                    <ScrollArea>
                        {activeConv?.messages.map((message) => (
                            <div key={message.id} className={`flex ${message.sender_id === userId ? "justify-end" : "justify-start"} mb-4`}>
                                <div className={`rounded-lg p-3 max-w-[80%] ${message.sender_id === userId ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                    <p><strong>{message.sender_name}</strong></p>
                                    <p>{message.content}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(message.timestamp).toLocaleString()}</p>
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
                        <Button type="submit" size="icon">
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    )
}