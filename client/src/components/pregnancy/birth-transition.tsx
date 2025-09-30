import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Heart, Calendar, Baby, ArrowRight, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

interface BirthTransitionProps {
  pregnancyId: number;
  onClose: () => void;
}

export default function BirthTransition({ pregnancyId, onClose }: BirthTransitionProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [babyName, setBabyName] = useState("");
  const [birthDate, setBirthDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [birthTime, setBirthTime] = useState(format(new Date(), "HH:mm"));
  const [gender, setGender] = useState<string>("");
  const [isTransitionComplete, setIsTransitionComplete] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const birthTransition = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      
      const dateTimeStr = `${birthDate}T${birthTime}`;
      
      return apiRequest(`/api/pregnancies/${pregnancyId}/birth`, {
        method: "POST",
        body: JSON.stringify({
          name: babyName,
          birthDate: new Date(dateTimeStr).toISOString(),
          gender: gender || undefined
        })
      });
    },
    onSuccess: (data) => {
      // Trigger confetti animation
      triggerConfetti();
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      
      setIsTransitionComplete(true);
      setCurrentStep(3);
      
      // Navigate to baby home after delay
      setTimeout(() => {
        navigate("/");
      }, 5000);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record birth. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  });
  
  const triggerConfetti = () => {
    setShowConfetti(true);
    
    // Run confetti animation
    const duration = 5000;
    const end = Date.now() + duration;
    
    const runConfetti = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 }
      });
      
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 }
      });
      
      if (Date.now() < end) {
        requestAnimationFrame(runConfetti);
      }
    };
    
    runConfetti();
  };
  
  const handleContinue = () => {
    if (currentStep === 1) {
      if (!babyName.trim()) {
        toast({
          title: "Baby name required",
          description: "Please enter a name for your baby",
          variant: "destructive"
        });
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      birthTransition.mutate();
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="relative">
          {!isTransitionComplete && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-2 z-10" 
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
          
          {/* Progress Steps */}
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                  currentStep >= 1 ? 'bg-pink-500 text-white' : 'bg-gray-200'
                }`}>
                  1
                </div>
                <div className={`h-1 w-5 ${
                  currentStep >= 2 ? 'bg-pink-500' : 'bg-gray-200'
                }`}></div>
                <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                  currentStep >= 2 ? 'bg-pink-500 text-white' : 'bg-gray-200'
                }`}>
                  2
                </div>
                <div className={`h-1 w-5 ${
                  currentStep >= 3 ? 'bg-pink-500' : 'bg-gray-200'
                }`}></div>
                <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                  currentStep >= 3 ? 'bg-pink-500 text-white' : 'bg-gray-200'
                }`}>
                  3
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-2">
                <h2 className="text-xl font-semibold">Welcome to the World!</h2>
                <p className="text-gray-600">Let's set up your baby's profile</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="baby-name">Baby's Name</Label>
                  <Input
                    id="baby-name"
                    value={babyName}
                    onChange={(e) => setBabyName(e.target.value)}
                    placeholder="Enter baby's name"
                    className="mt-1"
                    autoFocus
                  />
                </div>
                
                <div>
                  <Label>Gender (Optional)</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                className="w-full bg-pink-600 hover:bg-pink-700"
                onClick={handleContinue}
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-2">
                <h2 className="text-xl font-semibold">Birth Details</h2>
                <p className="text-gray-600">When did your baby arrive?</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="birth-date">Birth Date</Label>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                    <Input
                      id="birth-date"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="birth-time">Birth Time</Label>
                  <Input
                    id="birth-time"
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setCurrentStep(1)}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button 
                  className="flex-1 bg-pink-600 hover:bg-pink-700"
                  onClick={handleContinue}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Complete"}
                </Button>
              </div>
            </div>
          )}
          
          {currentStep === 3 && (
            <div className="space-y-6 text-center py-8">
              <div className="flex justify-center">
                <div className="h-24 w-24 rounded-full bg-pink-100 flex items-center justify-center">
                  <Baby className="h-12 w-12 text-pink-600" />
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-pink-600">Congratulations!</h2>
                <p className="text-gray-600 mt-2">
                  Welcome to the world, {babyName}! 
                  We've created a profile for your baby and transitioned you to baby tracking mode.
                </p>
              </div>
              
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span>Pregnancy records archived</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span>Baby profile created</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span>Tracking mode switched</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-500">
                Redirecting to baby tracking mode...
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Confetti overlay */}
      {showConfetti && <div id="confetti-canvas" className="fixed inset-0 z-40 pointer-events-none"></div>}
    </div>
  );
}
