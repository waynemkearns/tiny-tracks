import { useState, useEffect, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Play, Pause, StopCircle, Clock, Activity } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Contraction } from "@/types/api";

interface ContractionTimerProps {
  pregnancyId: number;
  onClose: () => void;
}

export default function ContractionTimer({ pregnancyId, onClose }: ContractionTimerProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [intensity, setIntensity] = useState(5);
  const [recentContractions, setRecentContractions] = useState<Contraction[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Start a new contraction
  const startContraction = useMutation<Contraction, Error, void>({
    mutationFn: async () => {
      const now = new Date();
      setStartTime(now);
      setElapsedTime(0);
      setIsTracking(true);
      
      const response = await fetch(`/api/pregnancies/${pregnancyId}/contractions`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startTime: now.toISOString(),
          intensity
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to start contraction');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Contraction Started",
        description: "Timer is now running",
      });
      
      // Add to recent contractions for immediate UI update
      setRecentContractions(prev => [data, ...prev].slice(0, 5));
    }
  });

  // Stop the current contraction
  const stopContraction = useMutation<Contraction, Error, number>({
    mutationFn: async (contractionId: number) => {
      const endTime = new Date();
      const duration = Math.round((endTime.getTime() - (startTime?.getTime() || 0)) / 1000);
      
      setIsTracking(false);
      setStartTime(null);
      
      const response = await fetch(`/api/contractions/${contractionId}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endTime: endTime.toISOString(),
          duration,
          intensity
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to stop contraction');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Contraction Recorded",
        description: `Duration: ${formatDuration(data.duration || 0)}`,
      });
      
      // Update the contraction in the UI
      setRecentContractions(prev => 
        prev.map(c => c.id === data.id ? data : c)
      );
      
      // Refresh contractions data
      queryClient.invalidateQueries({ queryKey: [`/api/pregnancies/${pregnancyId}/contractions`] });
    }
  });

  // Format seconds into MM:SS
  const formatDuration = (seconds: number) => {
    if (!seconds) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isTracking && startTime) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const started = startTime.getTime();
        const elapsed = Math.round((now - started) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, startTime]);

  // Calculate interval between contractions
  const calculateInterval = (current: Date, previous: Date) => {
    const diffMs = current.getTime() - previous.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    return `${diffMins} min`;
  };

  // Fetch recent contractions on component mount
  useEffect(() => {
    const fetchContractions = async () => {
      try {
        const response = await fetch(`/api/pregnancies/${pregnancyId}/contractions?limit=5`);
        if (!response.ok) {
          throw new Error('Failed to fetch contractions');
        }
        const data = await response.json() as Contraction[];
        setRecentContractions(data);
      } catch (error) {
        console.error("Failed to fetch contractions", error);
      }
    };
    
    fetchContractions();
  }, [pregnancyId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Contraction Timer</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Timer Display */}
          <div className="text-center">
            <div className="text-5xl font-bold mb-2 font-mono">
              {formatDuration(elapsedTime)}
            </div>
            <p className="text-gray-500 text-sm">
              {isTracking ? "Contraction in progress..." : "Tap start to begin timing"}
            </p>
          </div>
          
          {/* Intensity Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">
                Intensity: {intensity}/10
              </label>
            </div>
            <Slider
              defaultValue={[5]}
              max={10}
              min={1}
              step={1}
              value={[intensity]}
              onValueChange={(values) => setIntensity(values[0])}
              disabled={isTracking && recentContractions.length > 0}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Mild</span>
              <span>Moderate</span>
              <span>Strong</span>
            </div>
          </div>
          
          {/* Control Buttons */}
          <div className="flex justify-center space-x-4">
            {!isTracking ? (
              <Button 
                onClick={() => startContraction.mutate()}
                size="lg" 
                className="bg-pink-600 hover:bg-pink-700 text-white"
              >
                <Play className="h-5 w-5 mr-2" /> Start
              </Button>
            ) : (
              <Button 
                onClick={() => stopContraction.mutate(recentContractions[0].id)}
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={!recentContractions.length}
              >
                <StopCircle className="h-5 w-5 mr-2" /> Stop
              </Button>
            )}
          </div>
          
          {/* Recent Contractions */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-1" /> Recent Contractions
            </h3>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {recentContractions.length > 0 ? (
                recentContractions.map((contraction, index) => {
                  const startTimeFormatted = format(new Date(contraction.startTime), "h:mm a");
                  const durationFormatted = formatDuration(contraction.duration || 0);
                  const hasInterval = index < recentContractions.length - 1;
                  const interval = hasInterval 
                    ? calculateInterval(new Date(contraction.startTime), new Date(recentContractions[index + 1].startTime))
                    : null;
                  
                  return (
                    <div key={contraction.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{startTimeFormatted}</p>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="mr-2">{durationFormatted}</span>
                            <span>Intensity: {contraction.intensity}/10</span>
                          </div>
                        </div>
                        
                        {interval && (
                          <div className="text-right">
                            <span className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded">
                              {interval} apart
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No recent contractions</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
