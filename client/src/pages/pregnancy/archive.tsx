import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Download, Archive, FileDown, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import BottomNavigation from "@/components/bottom-navigation";
import UnifiedTimeline from "@/components/unified-timeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function PregnancyArchive() {
  const [, navigate] = useLocation();
  
  // For demo purposes
  const userId = 1;
  const pregnancyId = 1;
  const babyId = 1;
  
  const { data: pregnancy } = useQuery({
    queryKey: [`/api/pregnancies/${pregnancyId}`],
    // For demo, using placeholder data
    placeholderData: {
      id: pregnancyId,
      userId,
      estimatedDueDate: "2024-06-15T00:00:00Z",
      lastPeriodDate: "2023-09-08T00:00:00Z",
      isActive: false,
      babyId: 1,
      createdAt: "2023-09-15T00:00:00Z"
    }
  });
  
  const { data: baby } = useQuery<{ birthDate: string }>({
    queryKey: [`/api/babies/${babyId}`],
    enabled: !!pregnancy?.babyId,
    placeholderData: {
      birthDate: "2024-06-10T00:00:00Z"
    }
  });
  
  // Calculate pregnancy duration
  const calculatePregnancyDuration = () => {
    if (!pregnancy || !baby) return { weeks: 0, days: 0 };
    
    const start = new Date(pregnancy.lastPeriodDate);
    const end = new Date(baby.birthDate);
    
    const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(totalDays / 7);
    const days = totalDays % 7;
    
    return { weeks, days };
  };
  
  const pregnancyDuration = calculatePregnancyDuration();
  
  // Stats for the pregnancy
  const { data: pregnancyStats } = useQuery({
    queryKey: [`/api/pregnancies/${pregnancyId}/stats`],
    // For demo purposes
    placeholderData: {
      totalAppointments: 14,
      totalContractions: 32,
      totalMovements: 128,
      totalHealthRecords: 45,
      weightGain: 11.2, // kg
      symptomBreakdown: {
        nausea: 18,
        fatigue: 23,
        heartburn: 14,
        backache: 11,
        swelling: 9,
        other: 7
      }
    }
  });
  
  // Generate PDF export (mock functionality)
  const handleExportData = () => {
    // In a real app, this would trigger a PDF generation
    console.log("Exporting pregnancy data...");
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-3">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="p-1" onClick={() => navigate("/profile")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">Pregnancy Archive</h1>
        </div>
      </div>
      
      <div className="p-4 space-y-6">
        {/* Pregnancy Summary Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Pregnancy Summary</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="flex gap-1">
                    <Download className="h-4 w-4" /> Export
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Export Pregnancy Data</DialogTitle>
                    <DialogDescription>
                      Download your complete pregnancy data in various formats.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 mt-4">
                    <Button className="w-full flex items-center justify-between" onClick={handleExportData}>
                      PDF Summary Report <FileDown className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="w-full flex items-center justify-between" onClick={handleExportData}>
                      CSV Data Export <FileDown className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="w-full flex items-center justify-between" onClick={handleExportData}>
                      JSON Data Export <FileDown className="h-4 w-4" />
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {pregnancy && baby && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">PREGNANCY DURATION</p>
                  <p className="font-semibold">{pregnancyDuration.weeks} weeks, {pregnancyDuration.days} days</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">BIRTH DATE</p>
                  <p className="font-semibold">{format(new Date(baby.birthDate), "MMMM d, yyyy")}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">FIRST RECORDED</p>
                  <p className="font-semibold">{format(new Date(pregnancy.createdAt), "MMMM d, yyyy")}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">WEIGHT GAIN</p>
                  <p className="font-semibold">{pregnancyStats?.weightGain} kg</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Statistics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Tracking Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-blue-50 p-3">
                <div className="text-3xl font-semibold text-blue-700">
                  {pregnancyStats?.totalMovements || 0}
                </div>
                <div className="text-sm text-blue-600">Fetal Movements</div>
              </div>
              
              <div className="rounded-lg bg-pink-50 p-3">
                <div className="text-3xl font-semibold text-pink-700">
                  {pregnancyStats?.totalContractions || 0}
                </div>
                <div className="text-sm text-pink-600">Contractions</div>
              </div>
              
              <div className="rounded-lg bg-purple-50 p-3">
                <div className="text-3xl font-semibold text-purple-700">
                  {pregnancyStats?.totalAppointments || 0}
                </div>
                <div className="text-sm text-purple-600">Appointments</div>
              </div>
              
              <div className="rounded-lg bg-yellow-50 p-3">
                <div className="text-3xl font-semibold text-yellow-700">
                  {pregnancyStats?.totalHealthRecords || 0}
                </div>
                <div className="text-sm text-yellow-600">Health Records</div>
              </div>
            </div>
            
            {pregnancyStats?.symptomBreakdown && (
              <Accordion type="single" collapsible>
                <AccordionItem value="symptoms">
                  <AccordionTrigger className="text-sm">Symptom Breakdown</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {Object.entries(pregnancyStats.symptomBreakdown).map(([symptom, count]) => (
                        <div key={symptom} className="flex justify-between">
                          <span className="text-sm capitalize">{symptom}</span>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </CardContent>
        </Card>
        
        {/* Tabs for different data views */}
        <Tabs defaultValue="timeline">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="timeline" className="mt-4 space-y-4">
            <UnifiedTimeline 
              userId={userId} 
              pregnancyId={pregnancyId} 
              babyId={babyId}
              showPregnancy={true}
              showBaby={false}
            />
          </TabsContent>
          
          <TabsContent value="charts" className="mt-4">
            <Card>
              <CardContent className="py-4">
                <div className="text-center py-12 text-gray-500">
                  <p className="mb-2">Charts coming soon</p>
                  <p className="text-sm text-gray-400">
                    Visualizations for weight, blood pressure, symptoms, and more
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
