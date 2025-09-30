import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SymptomEntryModalProps {
  pregnancyId: number;
  onClose: () => void;
}

export default function SymptomEntryModal({ pregnancyId, onClose }: SymptomEntryModalProps) {
  const [symptomType, setSymptomType] = useState("");
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const symptoms = [
    { value: "nausea", label: "Nausea" },
    { value: "fatigue", label: "Fatigue" },
    { value: "headache", label: "Headache" },
    { value: "backache", label: "Back Pain" },
    { value: "heartburn", label: "Heartburn" },
    { value: "swelling", label: "Swelling" },
    { value: "insomnia", label: "Insomnia" },
    { value: "dizziness", label: "Dizziness" },
    { value: "leg_cramp", label: "Leg Cramps" },
    { value: "constipation", label: "Constipation" },
    { value: "spotting", label: "Spotting" },
    { value: "contractions", label: "Braxton Hicks" },
    { value: "other", label: "Other Symptom" },
  ];
  
  const addSymptomEntry = useMutation({
    mutationFn: async () => {
      setIsSubmitting(true);
      
      const res = await apiRequest(
        "POST",
        `/api/pregnancies/${pregnancyId}/health`,
        {
          type: "symptom",
          value: symptomType,
          timestamp: new Date().toISOString(),
          details: JSON.stringify({ severity }),
          notes: notes || undefined
        }
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/pregnancies/${pregnancyId}/health?type=symptom`] });
      toast({
        title: "Symptom recorded",
        description: "Your symptom has been saved successfully"
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save symptom entry",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symptomType) {
      toast({
        title: "Missing information",
        description: "Please select a symptom type",
        variant: "destructive"
      });
      return;
    }
    
    addSymptomEntry.mutate();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center">
            <Activity className="h-5 w-5 mr-2 text-yellow-600" />
            Record Symptom
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="symptom-type">Symptom Type</Label>
            <Select value={symptomType} onValueChange={setSymptomType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a symptom" />
              </SelectTrigger>
              <SelectContent>
                {symptoms.map(symptom => (
                  <SelectItem key={symptom.value} value={symptom.value}>
                    {symptom.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Severity</Label>
              <span className="text-sm font-medium">{severity}/10</span>
            </div>
            <Slider
              min={1}
              max={10}
              step={1}
              defaultValue={[5]}
              value={[severity]}
              onValueChange={(value) => setSeverity(value[0])}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Mild</span>
              <span>Moderate</span>
              <span>Severe</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Describe your symptoms, when they started, any triggers, etc."
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
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
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
