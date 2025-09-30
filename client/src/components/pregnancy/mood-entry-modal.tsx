import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, SmileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MoodEntryModalProps {
  pregnancyId: number;
  onClose: () => void;
}

export default function MoodEntryModal({ pregnancyId, onClose }: MoodEntryModalProps) {
  const [notes, setNotes] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const moods = [
    { value: "happy", emoji: "😊", label: "Happy" },
    { value: "calm", emoji: "😌", label: "Calm" },
    { value: "anxious", emoji: "😟", label: "Anxious" },
    { value: "sad", emoji: "😢", label: "Sad" },
    { value: "tired", emoji: "😴", label: "Tired" },
    { value: "energetic", emoji: "⚡", label: "Energetic" },
    { value: "irritable", emoji: "😠", label: "Irritable" },
    { value: "excited", emoji: "🤩", label: "Excited" }
  ];
  
  const addMoodEntry = useMutation({
    mutationFn: async () => {
      setIsSubmitting(true);
      
      return apiRequest(`/api/pregnancies/${pregnancyId}/health`, {
        method: "POST",
        body: JSON.stringify({
          type: "mood",
          value: selectedMood,
          timestamp: new Date().toISOString(),
          notes: notes || undefined
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/pregnancies/${pregnancyId}/health?type=mood`] });
      toast({
        title: "Mood recorded",
        description: "Your mood has been saved successfully"
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save mood entry",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMood) {
      toast({
        title: "Select a mood",
        description: "Please select how you're feeling",
        variant: "destructive"
      });
      return;
    }
    
    addMoodEntry.mutate();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center">
            <SmileIcon className="h-5 w-5 mr-2 text-blue-500" />
            How are you feeling?
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <Label className="mb-2 block">Select your mood</Label>
            <div className="grid grid-cols-4 gap-3">
              {moods.map((mood) => (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => setSelectedMood(mood.value)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg p-3
                    ${selectedMood === mood.value 
                      ? 'bg-blue-100 border-2 border-blue-400' 
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'}`}
                >
                  <span className="text-2xl mb-1">{mood.emoji}</span>
                  <span className="text-xs font-medium">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="What's making you feel this way?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          <div className="pt-2 flex space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              disabled={isSubmitting || !selectedMood}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
