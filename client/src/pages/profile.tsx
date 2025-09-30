import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit, Baby as BabyIcon, Settings, Share2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import type { Baby } from "@shared/schema";
import BottomNavigation from "@/components/bottom-navigation";
import { useLocation } from "wouter";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [babyName, setBabyName] = useState("");
  const [babyBirthDate, setBabyBirthDate] = useState("");
  const [babyGender, setBabyGender] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [shareData, setShareData] = useState(false);
  const [pregnancyMode, setPregnancyMode] = useState(true);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const babyId = 1; // Demo baby ID
  const userId = 1; // Demo user ID

  const { data: baby, isLoading: isLoadingBaby } = useQuery<Baby>({
    queryKey: [`/api/babies/${babyId}`],
  });
  
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: [`/api/users/${userId}`],
    // For demo purposes, use placeholderData since we don't have a real endpoint yet
    placeholderData: { id: userId, username: "user", pregnancyMode },
    onSuccess: (data) => {
      if (data) {
        setPregnancyMode(data.pregnancyMode);
      }
    }
  });

  // Update form fields when baby data loads
  useEffect(() => {
    if (baby) {
      setBabyName(baby.name || '');
      if (baby.birthDate) {
        try {
          const date = new Date(baby.birthDate);
          if (!isNaN(date.getTime())) {
            setBabyBirthDate(format(date, 'yyyy-MM-dd'));
          } else {
            setBabyBirthDate('2024-01-15');
          }
        } catch (error) {
          setBabyBirthDate('2024-01-15');
        }
      }
      setBabyGender(baby.gender || '');
    }
  }, [baby]);

  const updateBabyMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/babies/${babyId}`, {
        method: "PUT",
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/babies/${babyId}`] });
      toast({ title: "Baby profile updated successfully!" });
      setIsEditing(false);
    },
    onError: () => {
      toast({ title: "Failed to update profile", variant: "destructive" });
    },
  });

  const updatePregnancyModeMutation = useMutation({
    mutationFn: async (isEnabled: boolean) => {
      return apiRequest(`/api/users/${userId}/pregnancy-mode`, {
        method: "PUT",
        body: JSON.stringify({ pregnancyMode: isEnabled })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      toast({ 
        title: pregnancyMode ? "Pregnancy Mode Activated" : "Pregnancy Mode Deactivated",
        description: pregnancyMode 
          ? "You are now in pregnancy tracking mode" 
          : "You have switched to baby tracking mode"
      });
    },
    onError: () => {
      // Revert state on error
      setPregnancyMode(!pregnancyMode);
      toast({ 
        title: "Failed to update tracking mode", 
        variant: "destructive"
      });
    },
  });

  const handleSave = () => {
    if (!babyName.trim()) {
      toast({ title: "Please enter a name", variant: "destructive" });
      return;
    }

    updateBabyMutation.mutate({
      name: babyName,
      birthDate: babyBirthDate,
      gender: babyGender || null,
    });
  };

  const isLoading = isLoadingBaby || isLoadingUser;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const handlePregnancyModeToggle = (isEnabled: boolean) => {
    setPregnancyMode(isEnabled);
    updatePregnancyModeMutation.mutate(isEnabled);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="p-2" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">Profile</h1>
          </div>
          <Button 
            variant={isEditing ? "default" : "ghost"} 
            size="sm"
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            disabled={updateBabyMutation.isPending}
          >
            {isEditing ? "Save" : <Edit className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Baby Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <BabyIcon className="h-5 w-5 text-pink-500" />
              <span>Baby Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={babyName}
                onChange={(e) => setBabyName(e.target.value)}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="birthDate">Birth Date</Label>
              <Input
                id="birthDate"
                type="date"
                value={babyBirthDate}
                onChange={(e) => setBabyBirthDate(e.target.value)}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Gender</Label>
              <Select 
                value={babyGender} 
                onValueChange={setBabyGender}
                disabled={!isEditing}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-gray-600" />
              <span>App Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Pregnancy Mode</Label>
                <p className="text-xs text-gray-600">Track pregnancy instead of baby</p>
              </div>
              <Switch 
                checked={pregnancyMode} 
                onCheckedChange={handlePregnancyModeToggle}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Notifications</Label>
                <p className="text-xs text-gray-600">Get reminders for tracking and appointments</p>
              </div>
              <Switch 
                checked={notifications} 
                onCheckedChange={setNotifications}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Share Data</Label>
                <p className="text-xs text-gray-600">Allow caregivers to access data</p>
              </div>
              <Switch 
                checked={shareData} 
                onCheckedChange={setShareData}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Share2 className="h-5 w-5 text-blue-500" />
              <span>Data & Privacy</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Export Data
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Manage Caregivers
            </Button>
            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
              Delete Account
            </Button>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-medium text-gray-900">Baby Wellness Tracker</h3>
              <p className="text-sm text-gray-600">Version 1.0.0</p>
              <div className="flex justify-center space-x-2">
                <Badge variant="secondary">Privacy First</Badge>
                <Badge variant="secondary">Family-Friendly</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}