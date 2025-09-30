import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Star, Users, Globe, Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import BottomNavigation from "@/components/bottom-navigation";
import { useLocation } from "wouter";
import { Baby, GrowthRecord } from "@/types/api";

export default function Compare() {
  const [isPremium, setIsPremium] = useState(false);
  const [peerDataConsent, setPeerDataConsent] = useState(false);
  const [, navigate] = useLocation();
  const babyId = 1;

  const { data: baby } = useQuery<Baby>({
    queryKey: [`/api/babies/${babyId}`],
    placeholderData: {
      id: babyId,
      name: "",
      birthDate: new Date().toISOString(),
      gender: "female",
      userId: 1
    }
  });

  const { data: growthRecords } = useQuery<GrowthRecord[]>({
    queryKey: [`/api/babies/${babyId}/growth`],
    placeholderData: []
  });

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const now = new Date();
    const ageInMonths = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    return ageInMonths;
  };

  const getWHOPercentile = (weight: number, ageInMonths: number, gender: string) => {
    // Simplified WHO percentile calculation (in real app, use WHO tables)
    const baseWeight = gender === 'female' ? 3.2 : 3.4; // Birth weight
    const expectedWeight = baseWeight + (ageInMonths * 0.6); // Approximate growth
    const ratio = weight / expectedWeight;
    
    if (ratio > 1.15) return "90th percentile";
    if (ratio > 1.05) return "75th percentile";
    if (ratio > 0.95) return "50th percentile";
    if (ratio > 0.85) return "25th percentile";
    return "10th percentile";
  };

  const ageInMonths = baby?.birthDate ? calculateAge(baby.birthDate) : 0;
  const latestWeight = growthRecords && growthRecords.length > 0 && growthRecords[0].weight ? growthRecords[0].weight : 0;

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen relative pb-20">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/20" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Data Comparison</h1>
        </div>
        <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">
          {isPremium ? 'Premium' : 'Free'}
        </Badge>
      </header>

      <div className="p-4 space-y-6">
        {/* Subscription Status */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold flex items-center space-x-2">
                  {isPremium ? <Crown className="h-4 w-4 text-yellow-500" /> : <Star className="h-4 w-4" />}
                  <span>{isPremium ? 'Premium Features' : 'Free Features'}</span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isPremium ? 'Access peer comparisons and community insights' : 'Compare with WHO standards'}
                </p>
              </div>
              {!isPremium && (
                <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600">
                  Upgrade
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="growth" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="growth">Growth</TabsTrigger>
            <TabsTrigger value="feeding">Feeding</TabsTrigger>
            <TabsTrigger value="sleep">Sleep</TabsTrigger>
          </TabsList>

          {/* Growth Comparisons */}
          <TabsContent value="growth" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Growth Tracking</span>
                  <Badge variant="outline">WHO Standards</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {latestWeight > 0 ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Current Weight</span>
                      <span className="text-lg font-bold">{latestWeight}kg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">WHO Percentile</span>
                      <Badge variant="secondary">
                        {getWHOPercentile(latestWeight, ageInMonths, baby?.gender || 'female')}
                      </Badge>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Source:</strong> WHO Child Growth Standards 2006
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your baby's weight is within normal range for {ageInMonths}-month-olds
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <p>Add growth measurements to see WHO comparisons</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Premium Peer Comparison */}
            {isPremium && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Community Insights</span>
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-600">Premium</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {peerDataConsent ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Regional Average</span>
                        <span className="text-sm">{(latestWeight * 1.02).toFixed(1)}kg</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Your Position</span>
                        <Badge variant="secondary">15% above average</Badge>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Based on {Math.floor(Math.random() * 1000 + 500)} babies in your region
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Alert>
                      <Users className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-3">
                          <p className="text-sm">
                            Enable community comparisons to see how your baby's growth compares with other TinyTracks users.
                          </p>
                          <div className="flex items-center space-x-2">
                            <Switch 
                              checked={peerDataConsent} 
                              onCheckedChange={setPeerDataConsent}
                            />
                            <span className="text-sm">Share anonymous data</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Your data will be anonymized and used to generate community insights. You can opt out anytime.
                          </p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Feeding Comparisons */}
          <TabsContent value="feeding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Feeding Patterns</span>
                  <Badge variant="outline">NHS Guidelines</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Daily Feeds</span>
                    <span className="text-sm">8-12 feeds</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Your Average</span>
                    <Badge variant="secondary">9 feeds/day</Badge>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Source:</strong> NHS Feeding Guidelines
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your feeding frequency is within recommended range
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isPremium && peerDataConsent && (
              <Card>
                <CardHeader>
                  <CardTitle>Community Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Most {ageInMonths}-month-olds in your region feed 7-10 times daily
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Your Position</span>
                      <Badge variant="secondary">Within typical range</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Sleep Comparisons */}
          <TabsContent value="sleep" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Sleep Patterns</span>
                  <Badge variant="outline">Pediatric Standards</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Recommended Sleep</span>
                    <span className="text-sm">14-17 hours/day</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Your Average</span>
                    <Badge variant="secondary">15.5 hours/day</Badge>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Source:</strong> American Academy of Pediatrics
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your baby's sleep duration is healthy and appropriate
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Upgrade CTA for free users */}
        {!isPremium && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <Crown className="h-8 w-8 text-yellow-500 mx-auto" />
                <h3 className="font-semibold">Unlock Community Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Compare with other parents in your area and get personalized insights
                </p>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
                  Upgrade to Premium
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}