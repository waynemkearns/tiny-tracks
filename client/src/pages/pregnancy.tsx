import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, differenceInDays } from "date-fns";
import { Calendar, Clock, Clipboard, Activity, Check } from "lucide-react";
import BottomNavigation from "@/components/bottom-navigation";
import ContractionTimer from "@/components/pregnancy/contraction-timer";
import KickCounter from "@/components/pregnancy/kick-counter";
import BirthTransition from "@/components/pregnancy/birth-transition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Pregnancy, Contraction, FetalMovement, PregnancyAppointment } from "@/types/api";

export default function PregnancyHome() {
  const { toast } = useToast();
  // For demo purposes, using pregnancy ID 1
  const pregnancyId = 1;
  
  // Modal states
  const [showContractionTimer, setShowContractionTimer] = useState(false);
  const [showKickCounter, setShowKickCounter] = useState(false);
  const [showBirthTransition, setShowBirthTransition] = useState(false);
  
  const { data: pregnancy } = useQuery<Pregnancy>({
    queryKey: [`/api/pregnancies/${pregnancyId}`],
    placeholderData: {
      id: pregnancyId,
      userId: 1,
      estimatedDueDate: new Date().toISOString(),
      lastPeriodDate: new Date().toISOString(),
      isActive: true,
      createdAt: new Date().toISOString()
    }
  });
  
  interface GestationalAgeData {
    gestationalAge: {
      weeks: number;
      days: number;
    };
    trimester: number;
    daysUntilDueDate: number;
  }
  
  const { data: gestationalAge } = useQuery<GestationalAgeData>({
    queryKey: [`/api/pregnancies/${pregnancyId}/gestational-age`],
    refetchInterval: 1000 * 60 * 60 * 24, // Refetch once per day
    placeholderData: {
      gestationalAge: {
        weeks: 0,
        days: 0
      },
      trimester: 1,
      daysUntilDueDate: 0
    }
  });
  
  const { data: contractions } = useQuery<Contraction[]>({
    queryKey: [`/api/pregnancies/${pregnancyId}/contractions`],
    select: (data) => data?.slice(0, 3),
    placeholderData: []
  });
  
  const { data: appointments } = useQuery<PregnancyAppointment[]>({
    queryKey: [`/api/pregnancies/${pregnancyId}/appointments`],
    select: (data) => data?.filter(apt => !apt.completed).slice(0, 2),
    placeholderData: []
  });
  
  const { data: movements } = useQuery<FetalMovement[]>({
    queryKey: [`/api/pregnancies/${pregnancyId}/movements`],
    select: (data) => data?.slice(0, 3),
    placeholderData: []
  });
  
  // Calculate average contraction frequency if we have at least 2 contractions
  const contractionFrequency = contractions && contractions.length > 1
    ? Math.round((new Date(contractions[0].startTime).getTime() - new Date(contractions[1].startTime).getTime()) / (1000 * 60))
    : null;

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative pb-20">
      {/* Pregnancy Header */}
      <header className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-b-xl shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <Badge className="mb-2 bg-purple-200 text-purple-800 hover:bg-purple-300">Pregnancy Mode</Badge>
            <h1 className="text-2xl font-bold text-gray-900">My Pregnancy</h1>
            
            {gestationalAge && (
              <div className="mt-1 space-y-1">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="mr-2 h-4 w-4" /> 
                  <span>
                    <span className="font-semibold">{gestationalAge.gestationalAge.weeks} weeks, {gestationalAge.gestationalAge.days} days</span> 
                    <span className="ml-1 text-xs text-purple-700">(Trimester {gestationalAge.trimester})</span>
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="mr-2 h-4 w-4" /> 
                  <span>
                    <span className="font-semibold">{Math.abs(gestationalAge.daysUntilDueDate)}</span> days 
                    {gestationalAge.daysUntilDueDate > 0 ? ' until due date' : ' past due date'}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Due date countdown */}
          {gestationalAge && (
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-center 
              ${gestationalAge.daysUntilDueDate < 15 ? 'bg-pink-200 text-pink-800' : 'bg-purple-200 text-purple-800'}`}>
              <div>
                <div className="text-xl font-bold">{Math.abs(gestationalAge.daysUntilDueDate)}</div>
                <div className="text-xs">days</div>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Birth Mode Button - Special action */}
        <button
          onClick={() => setShowBirthTransition(true)}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl p-3 mb-4 flex items-center justify-center space-x-2"
        >
          <span className="text-xl">🎉</span>
          <span className="font-semibold">Baby Has Arrived!</span>
        </button>
      
        {/* Primary Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowContractionTimer(true)}
            className="bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-xl p-5 flex flex-col items-center space-y-2 touch-manipulation"
          >
            <div className="text-2xl">⏱️</div>
            <span className="font-medium">Contractions</span>
            {contractionFrequency && (
              <span className="text-xs">{contractionFrequency} min apart</span>
            )}
          </button>
          
          <button
            onClick={() => setShowKickCounter(true)}
            className="bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl p-5 flex flex-col items-center space-y-2 touch-manipulation"
          >
            <div className="text-2xl">👶</div>
            <span className="font-medium">Kicks</span>
            <span className="text-xs">Track movement</span>
          </button>
        </div>

        {/* Health Tracking */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Activity className="h-5 w-5 mr-2 text-purple-600" />
              Health Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <button 
                className="bg-purple-50 hover:bg-purple-100 p-3 rounded-lg flex flex-col items-center text-center"
                onClick={() => toast({ 
                  title: "Coming soon", 
                  description: "Weight tracking will be available in the next update."
                })}
              >
                <span className="text-lg mb-1">⚖️</span>
                <span className="text-sm font-medium">Weight</span>
              </button>
              
              <button 
                className="bg-purple-50 hover:bg-purple-100 p-3 rounded-lg flex flex-col items-center text-center"
                onClick={() => toast({ 
                  title: "Coming soon", 
                  description: "Blood pressure tracking will be available in the next update."
                })}
              >
                <span className="text-lg mb-1">💓</span>
                <span className="text-sm font-medium">Blood Pressure</span>
              </button>
              
              <button 
                className="bg-purple-50 hover:bg-purple-100 p-3 rounded-lg flex flex-col items-center text-center"
                onClick={() => toast({ 
                  title: "Coming soon", 
                  description: "Symptom tracking will be available in the next update."
                })}
              >
                <span className="text-lg mb-1">🤢</span>
                <span className="text-sm font-medium">Symptoms</span>
              </button>
              
              <button 
                className="bg-purple-50 hover:bg-purple-100 p-3 rounded-lg flex flex-col items-center text-center"
                onClick={() => toast({ 
                  title: "Coming soon", 
                  description: "Mood tracking will be available in the next update."
                })}
              >
                <span className="text-lg mb-1">😊</span>
                <span className="text-sm font-medium">Mood</span>
              </button>
            </div>
          </CardContent>
        </Card>
        
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-600" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointments && appointments.length > 0 ? (
              <div className="space-y-3">
                {appointments.map(appointment => (
                  <div key={appointment.id} className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <div>
                      <p className="font-medium">{appointment.title}</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(appointment.date), "MMM d, yyyy • h:mm a")}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="ghost" className="text-purple-600 w-full mt-2">
                  View All Appointments
                </Button>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>No upcoming appointments</p>
                <Button variant="outline" className="mt-2">
                  Add Appointment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Preparation Checklists */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Clipboard className="h-5 w-5 mr-2 text-purple-600" />
              Preparation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              <button 
                className="bg-purple-50 hover:bg-purple-100 p-3 rounded-lg flex flex-col items-center text-center"
                onClick={() => toast({ 
                  title: "Coming soon", 
                  description: "Birth plan checklist will be available in the next update."
                })}
              >
                <span className="text-lg mb-1">📝</span>
                <span className="text-xs font-medium">Birth Plan</span>
              </button>
              
              <button 
                className="bg-purple-50 hover:bg-purple-100 p-3 rounded-lg flex flex-col items-center text-center"
                onClick={() => toast({ 
                  title: "Coming soon", 
                  description: "Hospital bag checklist will be available in the next update."
                })}
              >
                <span className="text-lg mb-1">🧳</span>
                <span className="text-xs font-medium">Hospital Bag</span>
              </button>
              
              <button 
                className="bg-purple-50 hover:bg-purple-100 p-3 rounded-lg flex flex-col items-center text-center"
                onClick={() => toast({ 
                  title: "Coming soon", 
                  description: "Nursery checklist will be available in the next update."
                })}
              >
                <span className="text-lg mb-1">🛏️</span>
                <span className="text-xs font-medium">Nursery</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
      
      {/* Contraction Timer Modal */}
      {showContractionTimer && (
        <ContractionTimer
          pregnancyId={pregnancyId}
          onClose={() => setShowContractionTimer(false)}
        />
      )}
      
      {/* Kick Counter Modal */}
      {showKickCounter && (
        <KickCounter
          pregnancyId={pregnancyId}
          onClose={() => setShowKickCounter(false)}
        />
      )}
      
      {/* Birth Transition Modal */}
      {showBirthTransition && (
        <BirthTransition
          pregnancyId={pregnancyId}
          onClose={() => setShowBirthTransition(false)}
        />
      )}
    </div>
  );
}
