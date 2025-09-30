import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, subMonths } from "date-fns";
import { ArrowLeft, Activity, TrendingUp, Plus, Heart } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import BottomNavigation from "@/components/bottom-navigation";
import WeightEntryModal from "@/components/pregnancy/weight-entry-modal";
import BloodPressureEntryModal from "@/components/pregnancy/blood-pressure-entry-modal";
import SymptomEntryModal from "@/components/pregnancy/symptom-entry-modal";
import MoodEntryModal from "@/components/pregnancy/mood-entry-modal";

export default function PregnancyHealth() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const pregnancyId = 1; // Demo pregnancy ID
  
  // Modal states
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showBloodPressureModal, setShowBloodPressureModal] = useState(false);
  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);
  
  // Queries
  const { data: weightData } = useQuery({
    queryKey: [`/api/pregnancies/${pregnancyId}/health?type=weight`],
    placeholderData: generateMockWeightData(),
  });
  
  const { data: bloodPressureData } = useQuery({
    queryKey: [`/api/pregnancies/${pregnancyId}/health?type=blood_pressure`],
    placeholderData: generateMockBPData(),
  });
  
  const { data: symptomData } = useQuery({
    queryKey: [`/api/pregnancies/${pregnancyId}/health?type=symptom`],
    placeholderData: generateMockSymptomData(),
  });
  
  const { data: moodData } = useQuery({
    queryKey: [`/api/pregnancies/${pregnancyId}/health?type=mood`],
    placeholderData: generateMockMoodData(),
  });

  // Process weight data for chart
  const weightChartData = weightData?.map(item => ({
    date: format(new Date(item.timestamp), 'MM/dd'),
    weight: parseFloat(item.value)
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Process BP data for chart
  const bpChartData = bloodPressureData?.map(item => {
    const [systolic, diastolic] = item.value.split('/').map(Number);
    return {
      date: format(new Date(item.timestamp), 'MM/dd'),
      systolic,
      diastolic
    };
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Helper function to get the latest value
  const getLatestValue = (data: any[], type: string) => {
    if (!data?.length) return null;
    
    const sortedData = [...data].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    if (type === 'weight') {
      return `${sortedData[0].value} kg`;
    } else if (type === 'blood_pressure') {
      return sortedData[0].value;
    } else {
      return sortedData[0].value;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-3">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="p-1" onClick={() => navigate("/pregnancy")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">Maternal Health</h1>
        </div>
      </div>
      
      <div className="p-4 space-y-6 pb-24">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Current Weight</p>
                  <p className="text-xl font-semibold">
                    {getLatestValue(weightData, 'weight') || '-- kg'}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0" 
                  onClick={() => setShowWeightModal(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Blood Pressure</p>
                  <p className="text-xl font-semibold">
                    {getLatestValue(bloodPressureData, 'blood_pressure') || '--/--'}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0" 
                  onClick={() => setShowBloodPressureModal(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs for different health metrics */}
        <Tabs defaultValue="weight" className="space-y-4">
          <TabsList className="grid grid-cols-4 h-auto">
            <TabsTrigger value="weight" className="py-2">Weight</TabsTrigger>
            <TabsTrigger value="blood-pressure" className="py-2">BP</TabsTrigger>
            <TabsTrigger value="symptoms" className="py-2">Symptoms</TabsTrigger>
            <TabsTrigger value="mood" className="py-2">Mood</TabsTrigger>
          </TabsList>
          
          {/* Weight Tab */}
          <TabsContent value="weight" className="space-y-4">
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-purple-600" />
                  Weight Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={weightChartData}
                      margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <Button 
                  className="w-full mt-4"
                  onClick={() => setShowWeightModal(true)}
                >
                  Add Weight Entry
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Recent Entries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {weightData?.slice(0, 5).map((entry: any) => (
                  <div key={entry.id} className="flex justify-between py-2 border-b border-gray-100">
                    <div className="text-sm">
                      {format(new Date(entry.timestamp), 'MMM d, yyyy')}
                    </div>
                    <div className="font-medium">{entry.value} kg</div>
                  </div>
                ))}
                
                {(!weightData || weightData.length === 0) && (
                  <div className="text-center py-4 text-gray-500">
                    <p>No weight entries yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Blood Pressure Tab */}
          <TabsContent value="blood-pressure" className="space-y-4">
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center">
                  <Heart className="h-4 w-4 mr-2 text-red-500" />
                  Blood Pressure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={bpChartData}
                      margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[60, 160]} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="systolic" 
                        stroke="#ff7300" 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="diastolic" 
                        stroke="#387908" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <Button 
                  className="w-full mt-4"
                  onClick={() => setShowBloodPressureModal(true)}
                >
                  Add Blood Pressure Entry
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Recent Entries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {bloodPressureData?.slice(0, 5).map((entry: any) => (
                  <div key={entry.id} className="flex justify-between py-2 border-b border-gray-100">
                    <div className="text-sm">
                      {format(new Date(entry.timestamp), 'MMM d, yyyy h:mm a')}
                    </div>
                    <div className="font-medium">{entry.value}</div>
                  </div>
                ))}
                
                {(!bloodPressureData || bloodPressureData.length === 0) && (
                  <div className="text-center py-4 text-gray-500">
                    <p>No blood pressure entries yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Symptoms Tab */}
          <TabsContent value="symptoms" className="space-y-4">
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-yellow-600" />
                  Symptom Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full mb-4"
                  onClick={() => setShowSymptomModal(true)}
                >
                  Record New Symptom
                </Button>
                
                <div className="space-y-3">
                  {symptomData?.slice(0, 10).map((entry: any) => {
                    const symptomDetails = JSON.parse(entry.details || '{}');
                    return (
                      <div 
                        key={entry.id} 
                        className="p-3 bg-gray-50 rounded-lg border border-gray-100"
                      >
                        <div className="flex justify-between">
                          <div className="font-medium">{entry.value}</div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(entry.timestamp), 'MMM d, h:mm a')}
                          </div>
                        </div>
                        {symptomDetails.severity && (
                          <div className="mt-1 text-sm">
                            Severity: {symptomDetails.severity}/10
                          </div>
                        )}
                        {entry.notes && (
                          <div className="mt-1 text-sm text-gray-600">
                            {entry.notes}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {(!symptomData || symptomData.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No symptoms recorded yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Mood Tab */}
          <TabsContent value="mood" className="space-y-4">
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Mood Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full mb-4"
                  onClick={() => setShowMoodModal(true)}
                >
                  Record Current Mood
                </Button>
                
                <div className="space-y-3">
                  {moodData?.slice(0, 10).map((entry: any) => {
                    // Emoji mapping based on mood value
                    const moodEmojis: Record<string, string> = {
                      "happy": "😊",
                      "calm": "😌",
                      "anxious": "😟",
                      "sad": "😢",
                      "tired": "😴",
                      "energetic": "⚡",
                      "irritable": "😠",
                      "excited": "🤩"
                    };
                    
                    return (
                      <div 
                        key={entry.id} 
                        className="p-3 bg-gray-50 rounded-lg border border-gray-100"
                      >
                        <div className="flex justify-between">
                          <div className="font-medium">
                            <span className="text-2xl mr-2">
                              {moodEmojis[entry.value] || '😐'}
                            </span>
                            <span className="capitalize">{entry.value}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(entry.timestamp), 'MMM d, h:mm a')}
                          </div>
                        </div>
                        {entry.notes && (
                          <div className="mt-2 text-sm text-gray-600">
                            {entry.notes}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {(!moodData || moodData.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No mood entries recorded yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
      
      {/* Entry Modals */}
      {showWeightModal && (
        <WeightEntryModal 
          pregnancyId={pregnancyId}
          onClose={() => setShowWeightModal(false)}
        />
      )}
      
      {showBloodPressureModal && (
        <BloodPressureEntryModal 
          pregnancyId={pregnancyId}
          onClose={() => setShowBloodPressureModal(false)}
        />
      )}
      
      {showSymptomModal && (
        <SymptomEntryModal 
          pregnancyId={pregnancyId}
          onClose={() => setShowSymptomModal(false)}
        />
      )}
      
      {showMoodModal && (
        <MoodEntryModal 
          pregnancyId={pregnancyId}
          onClose={() => setShowMoodModal(false)}
        />
      )}
    </div>
  );
}

// Helper functions to generate mock data
function generateMockWeightData() {
  const today = new Date();
  const data = [];
  
  for (let i = 0; i < 10; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i * 7); // Weekly entries
    
    data.push({
      id: i + 1,
      pregnancyId: 1,
      type: "weight",
      value: (65 + i * 0.3).toFixed(1), // Increasing weight
      timestamp: date.toISOString(),
      details: null,
      notes: i === 0 ? "Monthly checkup measurement" : null
    });
  }
  
  return data.reverse();
}

function generateMockBPData() {
  const today = new Date();
  const data = [];
  
  for (let i = 0; i < 8; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i * 4); // Every few days
    
    // Systolic between 110-125, diastolic between 70-80
    const systolic = Math.floor(110 + Math.random() * 15);
    const diastolic = Math.floor(70 + Math.random() * 10);
    
    data.push({
      id: i + 1,
      pregnancyId: 1,
      type: "blood_pressure",
      value: `${systolic}/${diastolic}`,
      timestamp: date.toISOString(),
      details: null,
      notes: i === 0 ? "Measured after rest" : null
    });
  }
  
  return data.reverse();
}

function generateMockSymptomData() {
  const symptoms = [
    { type: "nausea", notes: "Morning sickness, subsided after breakfast" },
    { type: "fatigue", notes: "Extremely tired in the afternoon" },
    { type: "headache", notes: "Mild headache, took acetaminophen" },
    { type: "swelling", notes: "Slight ankle swelling after standing" },
    { type: "heartburn", notes: "After eating spicy food" }
  ];
  
  const today = new Date();
  const data = [];
  
  for (let i = 0; i < symptoms.length; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    date.setHours(Math.floor(Math.random() * 12) + 8); // Random time between 8am-8pm
    
    data.push({
      id: i + 1,
      pregnancyId: 1,
      type: "symptom",
      value: symptoms[i].type,
      timestamp: date.toISOString(),
      details: JSON.stringify({ severity: Math.floor(Math.random() * 5) + 3 }), // Severity 3-7
      notes: symptoms[i].notes
    });
  }
  
  return data.reverse();
}

function generateMockMoodData() {
  const moods = [
    { type: "happy", notes: "Felt good after prenatal yoga" },
    { type: "anxious", notes: "Worried about upcoming anatomy scan" },
    { type: "tired", notes: "Didn't sleep well last night" },
    { type: "excited", notes: "Felt baby kick for the first time!" },
    { type: "irritable", notes: "Hormone fluctuations" }
  ];
  
  const today = new Date();
  const data = [];
  
  for (let i = 0; i < moods.length; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    date.setHours(Math.floor(Math.random() * 12) + 8); // Random time between 8am-8pm
    
    data.push({
      id: i + 1,
      pregnancyId: 1,
      type: "mood",
      value: moods[i].type,
      timestamp: date.toISOString(),
      details: null,
      notes: moods[i].notes
    });
  }
  
  return data.reverse();
}
