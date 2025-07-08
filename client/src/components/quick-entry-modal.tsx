import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface QuickEntryModalProps {
  babyId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickEntryModal({ babyId, isOpen, onClose }: QuickEntryModalProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'nappy' | 'sleep' | 'health'>('feed');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Feed state
  const [feedType, setFeedType] = useState<'bottle' | 'breast_left' | 'breast_right' | 'breast_both'>('bottle');
  const [feedAmount, setFeedAmount] = useState('');
  const [feedDuration, setFeedDuration] = useState('');
  const [feedTime, setFeedTime] = useState(format(new Date(), 'HH:mm'));

  // Nappy state
  const [nappyType, setNappyType] = useState<'wet' | 'soiled' | 'both'>('wet');
  const [nappyTime, setNappyTime] = useState(format(new Date(), 'HH:mm'));

  // Sleep state
  const [sleepType, setSleepType] = useState<'start' | 'end'>('start');
  const [sleepCategory, setSleepCategory] = useState<'nap' | 'night'>('nap');
  const [sleepStartTime, setSleepStartTime] = useState(format(new Date(), 'HH:mm'));
  const [sleepEndTime, setSleepEndTime] = useState('');

  // Health state
  const [healthType, setHealthType] = useState<'temperature' | 'mood' | 'rash' | 'other'>('temperature');
  const [healthValue, setHealthValue] = useState('');
  const [healthTime, setHealthTime] = useState(format(new Date(), 'HH:mm'));

  const createFeedMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', `/api/babies/${babyId}/feeds`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/babies/${babyId}/feeds`] });
      queryClient.invalidateQueries({ queryKey: [`/api/babies/${babyId}/summary`] });
      toast({ title: "Feed recorded successfully!" });
      resetForm();
      onClose();
    },
    onError: () => {
      toast({ title: "Failed to record feed", variant: "destructive" });
    },
  });

  const createNappyMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', `/api/babies/${babyId}/nappies`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/babies/${babyId}/nappies`] });
      queryClient.invalidateQueries({ queryKey: [`/api/babies/${babyId}/summary`] });
      toast({ title: "Nappy change recorded successfully!" });
      resetForm();
      onClose();
    },
    onError: () => {
      toast({ title: "Failed to record nappy change", variant: "destructive" });
    },
  });

  const createSleepMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', `/api/babies/${babyId}/sleep`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/babies/${babyId}/sleep`] });
      queryClient.invalidateQueries({ queryKey: [`/api/babies/${babyId}/summary`] });
      toast({ title: "Sleep session recorded successfully!" });
      resetForm();
      onClose();
    },
    onError: () => {
      toast({ title: "Failed to record sleep session", variant: "destructive" });
    },
  });

  const createHealthMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', `/api/babies/${babyId}/health`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/babies/${babyId}/health`] });
      toast({ title: "Health record created successfully!" });
      resetForm();
      onClose();
    },
    onError: () => {
      toast({ title: "Failed to create health record", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFeedAmount('');
    setFeedDuration('');
    setHealthValue('');
    setSleepEndTime('');
  };

  const handleSaveFeed = () => {
    const today = new Date();
    const [hours, minutes] = feedTime.split(':');
    const timestamp = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes));

    const feedData = {
      type: feedType,
      timestamp: timestamp.toISOString(),
      ...(feedType === 'bottle' ? { amount: feedAmount } : { duration: parseInt(feedDuration) || 0 }),
    };

    createFeedMutation.mutate(feedData);
  };

  const handleSaveNappy = () => {
    const today = new Date();
    const [hours, minutes] = nappyTime.split(':');
    const timestamp = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes));

    const nappyData = {
      type: nappyType,
      timestamp: timestamp.toISOString(),
    };

    createNappyMutation.mutate(nappyData);
  };

  const handleSaveSleep = () => {
    const today = new Date();
    
    if (sleepType === 'start') {
      const [hours, minutes] = sleepStartTime.split(':');
      const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes));

      const sleepData = {
        type: sleepCategory,
        startTime: startTime.toISOString(),
      };

      createSleepMutation.mutate(sleepData);
    } else if (sleepEndTime) {
      const [startHours, startMinutes] = sleepStartTime.split(':');
      const [endHours, endMinutes] = sleepEndTime.split(':');
      
      const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(startHours), parseInt(startMinutes));
      const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(endHours), parseInt(endMinutes));
      
      // If end time is before start time, assume it's the next day
      if (endTime < startTime) {
        endTime.setDate(endTime.getDate() + 1);
      }

      const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

      const sleepData = {
        type: sleepCategory,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration,
      };

      createSleepMutation.mutate(sleepData);
    }
  };

  const handleSaveHealth = () => {
    const today = new Date();
    const [hours, minutes] = healthTime.split(':');
    const timestamp = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes));

    const healthData = {
      type: healthType,
      value: healthValue,
      timestamp: timestamp.toISOString(),
    };

    createHealthMutation.mutate(healthData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}>
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl max-w-md mx-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Quick Entry</h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 text-sm font-medium ${activeTab === 'feed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('feed')}
          >
            Feed
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium ${activeTab === 'nappy' ? 'text-yellow-600 border-b-2 border-yellow-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('nappy')}
          >
            Nappy
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium ${activeTab === 'sleep' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('sleep')}
          >
            Sleep
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium ${activeTab === 'health' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('health')}
          >
            Health
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {/* Feed Entry */}
          {activeTab === 'feed' && (
            <div className="space-y-4">
              <div>
                <Label>Feed Type</Label>
                <div className="flex space-x-2 mt-1">
                  <Button
                    variant={feedType === 'bottle' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFeedType('bottle')}
                  >
                    Bottle
                  </Button>
                  <Button
                    variant={feedType.startsWith('breast') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFeedType('breast_both')}
                  >
                    Breast
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {feedType === 'bottle' ? (
                  <div>
                    <Label htmlFor="amount">Amount (ml)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="120"
                      value={feedAmount}
                      onChange={(e) => setFeedAmount(e.target.value)}
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="duration">Duration (min)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="15"
                      value={feedDuration}
                      onChange={(e) => setFeedDuration(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="feed-time">Time</Label>
                  <Input
                    id="feed-time"
                    type="time"
                    value={feedTime}
                    onChange={(e) => setFeedTime(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                onClick={handleSaveFeed} 
                className="w-full bg-blue-500 hover:bg-blue-600"
                disabled={createFeedMutation.isPending}
              >
                {createFeedMutation.isPending ? 'Saving...' : 'Save Feed'}
              </Button>
            </div>
          )}

          {/* Nappy Entry */}
          {activeTab === 'nappy' && (
            <div className="space-y-4">
              <div>
                <Label>Nappy Type</Label>
                <div className="flex space-x-2 mt-1">
                  <Button
                    variant={nappyType === 'wet' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNappyType('wet')}
                  >
                    Wet
                  </Button>
                  <Button
                    variant={nappyType === 'soiled' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNappyType('soiled')}
                  >
                    Soiled
                  </Button>
                  <Button
                    variant={nappyType === 'both' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNappyType('both')}
                  >
                    Both
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="nappy-time">Time</Label>
                <Input
                  id="nappy-time"
                  type="time"
                  value={nappyTime}
                  onChange={(e) => setNappyTime(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleSaveNappy} 
                className="w-full bg-yellow-500 hover:bg-yellow-600"
                disabled={createNappyMutation.isPending}
              >
                {createNappyMutation.isPending ? 'Saving...' : 'Save Nappy'}
              </Button>
            </div>
          )}

          {/* Sleep Entry */}
          {activeTab === 'sleep' && (
            <div className="space-y-4">
              <div>
                <Label>Sleep Type</Label>
                <div className="flex space-x-2 mt-1">
                  <Button
                    variant={sleepCategory === 'nap' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSleepCategory('nap')}
                  >
                    Nap
                  </Button>
                  <Button
                    variant={sleepCategory === 'night' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSleepCategory('night')}
                  >
                    Night
                  </Button>
                </div>
              </div>

              <div>
                <Label>Action</Label>
                <div className="flex space-x-2 mt-1">
                  <Button
                    variant={sleepType === 'start' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSleepType('start')}
                  >
                    Start Sleep
                  </Button>
                  <Button
                    variant={sleepType === 'end' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSleepType('end')}
                  >
                    End Sleep
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sleep-start">Start Time</Label>
                  <Input
                    id="sleep-start"
                    type="time"
                    value={sleepStartTime}
                    onChange={(e) => setSleepStartTime(e.target.value)}
                  />
                </div>

                {sleepType === 'end' && (
                  <div>
                    <Label htmlFor="sleep-end">End Time</Label>
                    <Input
                      id="sleep-end"
                      type="time"
                      value={sleepEndTime}
                      onChange={(e) => setSleepEndTime(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <Button 
                onClick={handleSaveSleep} 
                className="w-full bg-purple-500 hover:bg-purple-600"
                disabled={createSleepMutation.isPending}
              >
                {createSleepMutation.isPending ? 'Saving...' : 'Save Sleep'}
              </Button>
            </div>
          )}

          {/* Health Entry */}
          {activeTab === 'health' && (
            <div className="space-y-4">
              <div>
                <Label>Health Type</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Button
                    variant={healthType === 'temperature' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setHealthType('temperature')}
                  >
                    Temperature
                  </Button>
                  <Button
                    variant={healthType === 'mood' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setHealthType('mood')}
                  >
                    Mood
                  </Button>
                  <Button
                    variant={healthType === 'rash' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setHealthType('rash')}
                  >
                    Rash
                  </Button>
                  <Button
                    variant={healthType === 'other' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setHealthType('other')}
                  >
                    Other
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="health-value">
                    {healthType === 'temperature' ? 'Temperature (°C)' : 'Description'}
                  </Label>
                  <Input
                    id="health-value"
                    type={healthType === 'temperature' ? 'number' : 'text'}
                    placeholder={healthType === 'temperature' ? '36.5' : 'Description'}
                    value={healthValue}
                    onChange={(e) => setHealthValue(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="health-time">Time</Label>
                  <Input
                    id="health-time"
                    type="time"
                    value={healthTime}
                    onChange={(e) => setHealthTime(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                onClick={handleSaveHealth} 
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={createHealthMutation.isPending}
              >
                {createHealthMutation.isPending ? 'Saving...' : 'Save Health Record'}
              </Button>
            </div>
          )}
        </div>

        <div className="p-4">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
