import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Clock, Calendar, AlertCircle, Activity, PlayCircle, PauseCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

interface KickCounterProps {
  pregnancyId: number;
  onClose: () => void;
}

export default function KickCounter({ pregnancyId, onClose }: KickCounterProps) {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [kickCount, setKickCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [responseToStimuli, setResponseToStimuli] = useState<string>("");
  const [recentMovements, setRecentMovements] = useState<any[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Start a new session
  const startSession = () => {
    const now = new Date();
    setSessionStartTime(now);
    setKickCount(0);
    setElapsedTime(0);
    setIsSessionActive(true);
    
    // Start timer
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
  };

  // End the session and save data
  const endSession = useMutation({
    mutationFn: () => {
      // Clear interval timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      const endTime = new Date();
      const durationSeconds = Math.round((endTime.getTime() - (sessionStartTime?.getTime() || 0)) / 1000);
      
      setIsSessionActive(false);
      
      const res = await apiRequest(
        "POST",
        `/api/pregnancies/${pregnancyId}/movements`,
        {
          timestamp: sessionStartTime?.toISOString(),
          duration: durationSeconds,
          responseToStimuli: responseToStimuli || undefined,
          notes: `${kickCount} movements recorded in ${formatDuration(durationSeconds)}`
        }
      );
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Session Saved",
        description: `${kickCount} movements recorded`
      });
      
      // Add to recent movements list for immediate UI update
      setRecentMovements(prev => [data, ...prev].slice(0, 5));
      
      // Reset states
      setSessionStartTime(null);
      setKickCount(0);
      setElapsedTime(0);
      setResponseToStimuli("");
      
      // Refresh movements data
      queryClient.invalidateQueries({ queryKey: [`/api/pregnancies/${pregnancyId}/movements`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save kick counting session",
        variant: "destructive"
      });
    }
  });

  // Record a kick
  const recordKick = () => {
    if (isSessionActive) {
      setKickCount(prev => prev + 1);
    }
  };

  // Format seconds to MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Fetch recent movements on component mount
  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const res = await apiRequest("GET", `/api/pregnancies/${pregnancyId}/movements?limit=5`);
        const data = await res.json();
        setRecentMovements(data);
      } catch (error) {
        console.error("Failed to fetch movements", error);
      }
    };
    
    fetchMovements();
  }, [pregnancyId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Kick Counter</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Counter Display */}
          <Card className={`text-center p-4 ${isSessionActive ? 'bg-purple-50 border-purple-200' : 'bg-gray-50'}`}>
            <CardTitle className="text-6xl font-bold text-purple-700 mb-2">
              {kickCount}
            </CardTitle>
            <CardDescription className="text-sm">
              {isSessionActive ? 'Tap the button below when you feel movement' : 'Start a session to count kicks'}
            </CardDescription>
            
            {isSessionActive && (
              <div className="mt-4 text-sm font-mono text-gray-600">
                Session time: {formatDuration(elapsedTime)}
              </div>
            )}
          </Card>
          
          {/* Response to Stimuli (if session is active) */}
          {isSessionActive && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Response to Stimuli (Optional)
              </label>
              <Select
                value={responseToStimuli}
                onValueChange={setResponseToStimuli}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a stimulus (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  <SelectItem value="food">After eating</SelectItem>
                  <SelectItem value="drink">After drinking</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="voice">Voice</SelectItem>
                  <SelectItem value="touch">Touch</SelectItem>
                  <SelectItem value="position_change">Position change</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Control Buttons */}
          <div className="space-y-4">
            {!isSessionActive ? (
              <Button 
                onClick={startSession}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white h-14"
              >
                <PlayCircle className="h-5 w-5 mr-2" /> Start Session
              </Button>
            ) : (
              <>
                <Button 
                  onClick={recordKick}
                  className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 h-20 text-xl"
                >
                  Tap When You Feel Movement
                </Button>
                
                <Button 
                  onClick={() => endSession.mutate()}
                  variant="outline" 
                  className="w-full border-red-300 text-red-700 hover:bg-red-50"
                >
                  <PauseCircle className="h-5 w-5 mr-2" /> End Session
                </Button>
              </>
            )}
          </div>
          
          {/* Previous Sessions */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2" /> Recent Movement Records
            </h3>
            
            {recentMovements.length > 0 ? (
              <div className="space-y-2">
                {recentMovements.map((movement) => {
                  const timestamp = new Date(movement.timestamp);
                  const date = format(timestamp, "MMM d");
                  const time = format(timestamp, "h:mm a");
                  const duration = movement.duration ? formatDuration(movement.duration) : "N/A";
                  const notes = movement.notes || "";
                  
                  return (
                    <div 
                      key={movement.id}
                      className="bg-gray-50 p-3 rounded-lg border border-gray-100"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{date} at {time}</div>
                          <div className="text-sm text-gray-600">{notes}</div>
                          {movement.responseToStimuli && (
                            <div className="text-xs mt-1 inline-block bg-purple-100 text-purple-700 rounded-full px-2 py-0.5">
                              Response to: {movement.responseToStimuli}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {duration}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No recent movement records</p>
              </div>
            )}
          </div>
          
          {/* Info Card */}
          <Card className="bg-blue-50 border-blue-100">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">About kick counting</p>
                  <p>Experts recommend counting kicks once a day in the third trimester. 
                  It's best to count at the same time each day when your baby is most active.
                  You should feel 10 movements within 2 hours, though it often takes less time.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
