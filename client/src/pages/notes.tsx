import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { Plus, FileText, Tag, Calendar, LinkIcon, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StandaloneNote } from "@shared/schema";

export default function NotesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<StandaloneNote | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [noteTime, setNoteTime] = useState(format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'));

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const babyId = 1; // TODO: Get from context/route params

  const { data: notes = [], isLoading } = useQuery<StandaloneNote[]>({
    queryKey: [`/api/babies/${babyId}/notes`],
  });

  const createNoteMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', `/api/babies/${babyId}/notes`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/babies/${babyId}/notes`] });
      toast({ title: "Note created successfully!" });
      resetForm();
      setIsCreateModalOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to create note", variant: "destructive" });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest('PUT', `/api/babies/${babyId}/notes/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/babies/${babyId}/notes`] });
      toast({ title: "Note updated successfully!" });
      resetForm();
      setEditingNote(null);
    },
    onError: () => {
      toast({ title: "Failed to update note", variant: "destructive" });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/babies/${babyId}/notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/babies/${babyId}/notes`] });
      toast({ title: "Note deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete note", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setTitle("");
    setContent("");
    setTags([]);
    setNewTag("");
    setNoteTime(format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSave = () => {
    const timestamp = new Date(noteTime).toISOString();
    const noteData = {
      title: title.trim() || undefined,
      content: content.trim(),
      tags: tags.length > 0 ? tags : undefined,
      timestamp,
    };

    if (editingNote) {
      updateNoteMutation.mutate({ id: editingNote.id, data: noteData });
    } else {
      createNoteMutation.mutate(noteData);
    }
  };

  const startEdit = (note: StandaloneNote) => {
    setEditingNote(note);
    setTitle(note.title || "");
    setContent(note.content || "");
    setTags(note.tags || []);
    setNoteTime(format(new Date(note.timestamp), 'yyyy-MM-dd\'T\'HH:mm'));
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNoteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notes & Captures</h1>
          <p className="text-gray-600">Consolidate your external notes and photos</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>New Note</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingNote ? "Edit Note" : "Create New Note"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  placeholder="Note title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Enter your note content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              <div>
                <Label htmlFor="time">Date & Time</Label>
                <Input
                  id="time"
                  type="datetime-local"
                  value={noteTime}
                  onChange={(e) => setNoteTime(e.target.value)}
                />
              </div>

              {/* Tags */}
              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                      <span>{tag}</span>
                      <button onClick={() => removeTag(tag)} aria-label={`Remove tag ${tag}`}>
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex space-x-2 mt-2">
                  <Input
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button size="sm" onClick={addTag}>
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {
                  resetForm();
                  setIsCreateModalOpen(false);
                  setEditingNote(null);
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={!content.trim() || createNoteMutation.isPending || updateNoteMutation.isPending}
                >
                  {(createNoteMutation.isPending || updateNoteMutation.isPending) ? 'Saving...' : 'Save Note'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notes List */}
      {notes.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No notes yet</h3>
            <p className="text-gray-600 mb-4">
              Start capturing your external notes, photos, and voice memos in one place.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first note
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notes.map((note: StandaloneNote) => (
            <Card key={note.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    {note.title && (
                      <CardTitle className="text-lg mb-1">{note.title}</CardTitle>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(note.timestamp), 'MMM d, yyyy HH:mm')}</span>
                      </span>
                      <span>{formatDistanceToNow(new Date(note.timestamp), { addSuffix: true })}</span>
                      {note.linkedToType && note.linkedToId && (
                        <span className="flex items-center space-x-1 text-blue-600">
                          <LinkIcon className="h-4 w-4" />
                          <span>Linked to {note.linkedToType}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(note)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(note.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {note.content && (
                  <p className="text-gray-800 mb-3 whitespace-pre-wrap">{note.content}</p>
                )}
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}