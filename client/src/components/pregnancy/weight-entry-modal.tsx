import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WeightEntryModalProps {
  pregnancyId: number;
  onClose: () => void;
}

export default function WeightEntryModal({ pregnancyId, onClose }: WeightEntryModalProps) {
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const addWeightEntry = useMutation({
    mutationFn: async () => {
      setIsSubmitting(true);
      
      return apiRequest(`/api/pregnancies/${pregnancyId}/health`, {
        method: "POST",
        body: JSON.stringify({
          type: "weight",
          value: weight,
          timestamp: new Date().toISOString(),
          notes: notes || undefined
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/pregnancies/${pregnancyId}/health?type=weight`] });
      toast({
        title: "Weight recorded",
        description: "Your weight has been saved successfully"
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save weight entry",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!weight || isNaN(parseFloat(weight))) {
      toast({
        title: "Invalid weight",
        description: "Please enter a valid weight value",
        variant: "destructive"
      });
      return;
    }
    
    addWeightEntry.mutate();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center">
            <Scale className="h-5 w-5 mr-2 text-purple-600" />
            Record Weight
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <div className="flex">
              <Input 
                id="weight"
                type="number"
                step="0.1"
                placeholder="e.g., 65.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="flex-1"
                required
              />
              <span className="ml-2 flex items-center text-gray-500">kg</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          <div className="pt-4 flex space-x-3">
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
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
