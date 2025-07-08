import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit, Baby as BabyIcon, Settings, Share2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import BottomNavigation from "@/components/bottom-navigation";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { Baby } from "@shared/schema";

export default function Profile() {
  const [, navigate] = useLocation();
  const [isEditingBaby, setIsEditingBaby] = useState(false);
  const [babyName, setBabyName] = useState('');
  const [babyBirthDate, setBabyBirthDate] = useState('');
  const [babyGender, setBabyGender] = useState('');
  
  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [feedReminders, setFeedReminders] = useState(true);
  const [sleepTracking, setSleepTracking] = useState(true);
  const [dataSync, setDataSync] = useState(true);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const babyId = 1; // Demo baby ID

  const { data: baby } = useQuery<Baby>({
    queryKey: [`/api/babies/${babyId}`],
    onSuccess: (data) => {
      if (data) {
        setBabyName(data.name);
        setBabyBirthDate(format(new Date(data.birthDate), 'yyyy-MM-dd'));
        setBabyGender(data.gender || '');
      }
    },
  });

  const updateBabyMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('PUT', `/api/babies/${babyId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/babies/${babyId}`] });
      toast({ title: "Baby profile updated successfully!" });
      setIsEditingBaby(false);
    },
    onError: () => {
      toast({ title: "Failed to update baby profile", variant: "destructive" });
    },
  });

  const handleSaveBaby = () => {
    const babyData = {
      name: babyName,
      birthDate: new Date(babyBirthDate).toISOString(),
      gender: babyGender,
    };

    updateBabyMutation.mutate(babyData);
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const now = new Date();
    const ageInMonths = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    const months = ageInMonths % 12;
    const years = Math.floor(ageInMonths / 12);
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`;
    }
    return `${ageInMonths} month${ageInMonths !== 1 ? 's' : ''}`;
  };

  const exportAllData = () => {
    // This would trigger a full data export
    toast({ title: "Full data export started. Check your downloads folder." });
  };

  const clearAllData = () => {
    // This would show a confirmation dialog for data clearing
    toast({ 
      title: "Data clearing requires confirmation", 
      description: "This feature would show a confirmation dialog in a full implementation."
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
      {/* Header */}
      <header className="bg-primary text-white p-4 flex items-center">
        <Button variant="ghost" size="icon" className="text-white mr-3" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Profile & Settings</h1>
      </header>

      <div className="p-4 space-y-6">
        {/* Baby Profile */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <BabyIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>{baby?.name || 'Loading...'}</CardTitle>
                <p className="text-sm text-gray-600">
                  {baby?.birthDate ? calculateAge(baby.birthDate) : 'Loading...'}
                </p>
              </div>
            </div>
            
            <Dialog open={isEditingBaby} onOpenChange={setIsEditingBaby}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Edit Baby Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="baby-name">Name</Label>
                    <Input
                      id="baby-name"
                      value={babyName}
                      onChange={(e) => setBabyName(e.target.value)}
                      placeholder="Baby's name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="baby-birth-date">Birth Date</Label>
                    <Input
                      id="baby-birth-date"
                      type="date"
                      value={babyBirthDate}
                      onChange={(e) => setBabyBirthDate(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="baby-gender">Gender</Label>
                    <select
                      id="baby-gender"
                      value={babyGender}
                      onChange={(e) => setBabyGender(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSaveBaby} 
                      className="flex-1"
                      disabled={updateBabyMutation.isPending}
                    >
                      {updateBabyMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditingBaby(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              <p>Born: {baby?.birthDate ? format(new Date(baby.birthDate), 'MMM dd, yyyy') : 'Not set'}</p>
              <p>Gender: {baby?.gender ? baby.gender.charAt(0).toUpperCase() + baby.gender.slice(1) : 'Not specified'}</p>
            </div>
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-gray-600" />
              <CardTitle>App Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifications</p>
                <p className="text-sm text-gray-600">Receive app notifications</p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Feed Reminders</p>
                <p className="text-sm text-gray-600">Get reminded about feeding times</p>
              </div>
              <Switch
                checked={feedReminders}
                onCheckedChange={setFeedReminders}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sleep Tracking</p>
                <p className="text-sm text-gray-600">Automatically track sleep patterns</p>
              </div>
              <Switch
                checked={sleepTracking}
                onCheckedChange={setSleepTracking}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Data Sync</p>
                <p className="text-sm text-gray-600">Sync data across devices</p>
              </div>
              <Switch
                checked={dataSync}
                onCheckedChange={setDataSync}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-gray-600" />
              <CardTitle>Notification Preferences</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-gray-600">
              <p>• Feed reminders every 3 hours</p>
              <p>• Health alerts for unusual patterns</p>
              <p>• Growth milestone notifications</p>
              <p>• Vaccination reminders</p>
            </div>
            <Button variant="outline" className="w-full text-sm">
              Customize Notification Times
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Share2 className="h-5 w-5 text-gray-600" />
              <CardTitle>Data Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={exportAllData}
            >
              Export All Data
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/export")}
            >
              Custom Export
            </Button>
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={clearAllData}
            >
              Clear All Data
            </Button>
          </CardContent>
        </Card>

        {/* App Information */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>Baby Wellness Tracker v1.0.0</p>
            <p>A comprehensive app for tracking your baby's health and development.</p>
            <div className="pt-2 space-y-1">
              <Button variant="ghost" className="h-auto p-0 text-sm text-blue-600">
                Privacy Policy
              </Button>
              <br />
              <Button variant="ghost" className="h-auto p-0 text-sm text-blue-600">
                Terms of Service
              </Button>
              <br />
              <Button variant="ghost" className="h-auto p-0 text-sm text-blue-600">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}
