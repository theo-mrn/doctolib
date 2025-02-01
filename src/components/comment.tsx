"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { supabase } from '@/lib/supabase'
import { Pencil, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface CommentSectionProps {
  salonId: number;
}

interface Comment {
  id: string;
  salon_id: number;
  client_id: string;
  content: string;
  created_at: string;
  editing?: boolean;
}

export default function CommentsSection({ salonId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [editingComment, setEditingComment] = useState<string>("")
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserAndComments = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUserId(session.user.id)
      }

      const { data: commentsData, error } = await supabase
        .from('comments')
        .select('*')
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur lors de la récupération des commentaires:', error.message)
        return
      }

      setComments(commentsData || [])
    }

    fetchUserAndComments()
  }, [salonId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userId) {
      handleLoginRedirect()
      return
    }

    if (!newComment.trim()) return

    const newCommentData = {
      salon_id: salonId,
      client_id: userId,
      content: newComment.trim(),
    }

    const { data: insertedComment, error } = await supabase
      .from('comments')
      .insert(newCommentData)
      .select()
      .single()

    if (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error.message)
      return
    }

    if (insertedComment) {
      setComments([insertedComment, ...comments])
      setNewComment("")
    }
  }

  const handleEdit = (commentId: string) => {
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { ...comment, editing: true }
        : comment
    ))
    const commentToEdit = comments.find(c => c.id === commentId)
    if (commentToEdit) {
      setEditingComment(commentToEdit.content)
    }
  }

  const handleSaveEdit = async (commentId: string) => {
    const { error } = await supabase
      .from('comments')
      .update({ content: editingComment })
      .eq('id', commentId)

    if (error) {
      console.error('Erreur lors de la modification du commentaire:', error.message)
      return
    }

    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { ...comment, content: editingComment, editing: false }
        : comment
    ))
    setEditingComment("")
  }

  const handleDelete = async (commentId: string) => {
    setCommentToDelete(commentId)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!commentToDelete) return

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentToDelete)

    if (error) {
      console.error('Erreur lors de la suppression du commentaire:', error.message)
      return
    }

    setComments(comments.filter(comment => comment.id !== commentToDelete))
    setIsDeleteModalOpen(false)
    setCommentToDelete(null)
  }

  const handleLoginRedirect = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/connexion'
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 p-4">
      {userId && (
        <Card className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Écrivez votre commentaire ici..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px]"
            />
            <Button type="submit">Publier le commentaire</Button>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment.id} className="p-4 space-y-2">
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-500">
                {new Date(comment.created_at).toLocaleDateString("fr-FR")}
              </span>
              {userId === comment.client_id && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(comment.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(comment.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
            
            {comment.editing ? (
              <div className="space-y-2">
                <Textarea
                  value={editingComment}
                  onChange={(e) => setEditingComment(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setComments(comments.map(c => 
                        c.id === comment.id 
                          ? { ...c, editing: false }
                          : c
                      ))
                      setEditingComment("")
                    }}
                  >
                    Annuler
                  </Button>
                  <Button onClick={() => handleSaveEdit(comment.id)}>
                    Enregistrer
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">{comment.content}</p>
            )}
          </Card>
        ))}
      </div>

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Ce commentaire sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCommentToDelete(null)}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

