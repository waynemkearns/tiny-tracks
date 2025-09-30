import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BloodPressureEntryModalProps {
  pregnancyId: number;
  onClose: () => void;
}

export default function BloodPressureEntryModal({ pregnancyId, onClose }: BloodPressureEntryModalProps) {
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const addBPEntry = useMutation({
    mutationFn: async () => {
      setIsSubmitting(true);
      
      return apiRequest(`/api/pregnancies/${pregnancyId}/health`, {
        method: "POST",
        body: JSON.stringify({
          type: "blood_pressure",
          value: `${systolic}/${diastolic}`,
          timestamp: new Date().toISOString(),
          notes: notes || undefined
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/pregnancies/${pregnancyId}/health?type=blood_pressure`] });
      toast({
        title: "Blood pressure recorded",
        description: "Your blood pressure has been saved successfully"
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save blood pressure entry",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const systolicNum = parseInt(systolic);
    const diastolicNum = parseInt(diastolic);
    
    if (isNaN(systolicNum) || isNaN(diastolicNum)) {
      toast({
        title: "Invalid values",
        description: "Please enter valid numbers for both readings",
        variant: "destructive"
      });
      return;
    }
    
    if (systolicNum < 70 || systolicNum > 200) {
      toast({
        title: "Invalid systolic pressure",
        description: "Please enter a value between 70 and 200",
        variant: "destructive"
      });
      return;
    }
    
    if (diastolicNum < 40 || diastolicNum > 120) {
      toast({
        title: "Invalid diastolic pressure",
        description: "Please enter a value between 40 and 120",
        variant: "destructive"
      });
      return;
    }
    
    addBPEntry.mutate();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center">
            <Heart className="h-5 w-5 mr-2 text-red-500" />
            Record Blood Pressure
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="systolic">Systolic (top number)</Label>
              <Input 
                id="systolic"
                type="number"
                placeholder="e.g., 120"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="diastolic">Diastolic (bottom number)</Label>
              <Input 
                id="diastolic"
                type="number"
                placeholder="e.g., 80"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information like activity level, time of day, etc."
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
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
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
