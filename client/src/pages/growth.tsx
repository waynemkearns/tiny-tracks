import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import BottomNavigation from "@/components/bottom-navigation";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { GrowthRecord } from "@shared/schema";

export default function Growth() {
  const [, navigate] = useLocation();
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [headCircumference, setHeadCircumference] = useState('');
  const [recordDate, setRecordDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const babyId = 1; // Demo baby ID

  const { data: growthRecords = [] } = useQuery<GrowthRecord[]>({
    queryKey: [`/api/babies/${babyId}/growth`],
  });

  const createGrowthMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', `/api/babies/${babyId}/growth`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/babies/${babyId}/growth`] });
      toast({ title: "Growth record added successfully!" });
      setIsAddingRecord(false);
      setWeight('');
      setHeight('');
      setHeadCircumference('');
    },
    onError: () => {
      toast({ title: "Failed to add growth record", variant: "destructive" });
    },
  });

  const handleSaveRecord = () => {
    const recordDateTime = new Date(recordDate);
    recordDateTime.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues

    const growthData = {
      weight: weight ? parseFloat(weight) : null,
      height: height ? parseFloat(height) : null,
      headCircumference: headCircumference ? parseFloat(headCircumference) : null,
      timestamp: recordDateTime.toISOString(),
    };

    createGrowthMutation.mutate(growthData);
  };

  const formatMeasurement = (value: any, unit: string) => {
    if (!value) return 'Not recorded';
    return `${parseFloat(value).toFixed(1)} ${unit}`;
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
      {/* Header */}
      <header className="bg-primary text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="text-white mr-3" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Growth Tracking</h1>
        </div>
        
        <Dialog open={isAddingRecord} onOpenChange={setIsAddingRecord}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white">
              <Plus className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Add Growth Record</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="record-date">Date</Label>
                <Input
                  id="record-date"
                  type="date"
                  value={recordDate}
                  onChange={(e) => setRecordDate(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="4.2"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  placeholder="52.5"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="head">Head Circumference (cm)</Label>
                <Input
                  id="head"
                  type="number"
                  step="0.1"
                  placeholder="36.2"
                  value={headCircumference}
                  onChange={(e) => setHeadCircumference(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveRecord} 
                  className="flex-1"
                  disabled={createGrowthMutation.isPending}
                >
                  {createGrowthMutation.isPending ? 'Saving...' : 'Save Record'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddingRecord(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <div className="p-4">
        {/* Current Stats */}
        {growthRecords.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Latest Measurements</CardTitle>
              <p className="text-sm text-gray-600">
                {format(new Date(growthRecords[0].timestamp), 'MMM dd, yyyy')}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatMeasurement(growthRecords[0].weight, 'kg')}
                  </p>
                  <p className="text-sm text-gray-600">Weight</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {formatMeasurement(growthRecords[0].height, 'cm')}
                  </p>
                  <p className="text-sm text-gray-600">Height</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatMeasurement(growthRecords[0].headCircumference, 'cm')}
                  </p>
                  <p className="text-sm text-gray-600">Head</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Growth History */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Growth History</h2>
          
          {growthRecords.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500 mb-4">No growth records yet.</p>
                <Button onClick={() => setIsAddingRecord(true)}>
                  Add First Record
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {growthRecords.map((record) => (
                <Card key={record.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium">
                        {format(new Date(record.timestamp), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Weight</p>
                        <p className="font-medium">
                          {formatMeasurement(record.weight, 'kg')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Height</p>
                        <p className="font-medium">
                          {formatMeasurement(record.height, 'cm')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Head</p>
                        <p className="font-medium">
                          {formatMeasurement(record.headCircumference, 'cm')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
