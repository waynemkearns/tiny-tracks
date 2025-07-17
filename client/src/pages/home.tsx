import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Baby, Menu, Users, Settings, Share2, HelpCircle, Crown } from "lucide-react";
import StatsOverview from "@/components/stats-overview";
import ActivityFeed from "@/components/activity-feed";
import ChartPreview from "@/components/chart-preview";
import QuickEntryModal from "@/components/quick-entry-modal";
import BottomNavigation from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useLocation } from "wouter";

export default function Home() {
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const [quickActionType, setQuickActionType] = useState<'feed' | 'nappy' | 'sleep' | 'health'>('feed');
  const [, navigate] = useLocation();
  
  // For demo purposes, using baby ID 1 - in a real app this would come from user context
  const babyId = 1;
  const today = new Date();

  const { data: baby } = useQuery({
    queryKey: [`/api/babies/${babyId}`],
  });

  const { data: dailySummary } = useQuery({
    queryKey: [`/api/babies/${babyId}/summary/${format(today, 'yyyy-MM-dd')}`],
  });

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

  const handleQuickAction = (type: 'feed' | 'nappy' | 'sleep' | 'health') => {
    setQuickActionType(type);
    setShowQuickEntry(true);
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative pb-20">
      {/* Header */}
      <header className="bg-primary text-white p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <Baby className="h-6 w-6" />
          <div>
            <h1 className="text-lg font-semibold">
              {baby?.name || 'Loading...'}'s Tracker
            </h1>
            <p className="text-sm opacity-90">
              {baby?.birthDate ? calculateAge(baby.birthDate) : 'Loading...'}
            </p>
          </div>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle>TinyTracks Menu</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-3">
              <Button 
                variant="ghost" 
                className="w-full justify-start space-x-3 h-12"
                onClick={() => navigate('/compare')}
              >
                <Users className="h-5 w-5" />
                <span>Data Comparison</span>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start space-x-3 h-12"
                onClick={() => navigate('/profile')}
              >
                <Settings className="h-5 w-5" />
                <span>Settings & Profile</span>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start space-x-3 h-12"
                onClick={() => navigate('/export')}
              >
                <Share2 className="h-5 w-5" />
                <span>Data Export</span>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start space-x-3 h-12 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700"
              >
                <Crown className="h-5 w-5" />
                <span>Premium Upgrade</span>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start space-x-3 h-12"
              >
                <HelpCircle className="h-5 w-5" />
                <span>Help / FAQ</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <div className="p-4 space-y-6">
        {/* Primary Action Tiles - Always Visible at Top */}
        <div className="space-y-4">
          {/* Feed Tile - Full Width */}
          <button
            onClick={() => handleQuickAction('feed')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-2xl p-8 flex flex-col items-center justify-center space-y-4 shadow-lg active:scale-95 transition-all duration-200 min-h-[140px] touch-manipulation"
          >
            <div className="text-4xl">🍼</div>
            <span className="font-bold text-xl">Feed Baby</span>
            <span className="text-sm opacity-90">Two taps to log feeding</span>
          </button>

          {/* Change Tile - Full Width */}
          <button
            onClick={() => handleQuickAction('nappy')}
            className="w-full bg-green-500 hover:bg-green-600 text-white rounded-2xl p-8 flex flex-col items-center justify-center space-y-4 shadow-lg active:scale-95 transition-all duration-200 min-h-[140px] touch-manipulation"
          >
            <div className="text-4xl">🧷</div>
            <span className="font-bold text-xl">Change Diaper</span>
            <span className="text-sm opacity-90">One tap to log change</span>
          </button>
        </div>

        {/* Secondary Actions - Scrollable Below Primary */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleQuickAction('sleep')}
            className="bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl p-4 flex flex-col items-center space-y-2 touch-manipulation"
          >
            <div className="text-2xl">😴</div>
            <span className="font-medium text-sm">Sleep</span>
          </button>
          
          <button
            onClick={() => handleQuickAction('health')}
            className="bg-red-100 hover:bg-red-200 text-red-700 rounded-xl p-4 flex flex-col items-center space-y-2 touch-manipulation"
          >
            <div className="text-2xl">🌡️</div>
            <span className="font-medium text-sm">Health</span>
          </button>
          
          <button
            className="bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-xl p-4 flex flex-col items-center space-y-2 touch-manipulation"
          >
            <div className="text-2xl">📏</div>
            <span className="font-medium text-sm">Growth</span>
          </button>
        </div>
        
        {/* Daily Summary */}
        <StatsOverview babyId={babyId} dailySummary={dailySummary} />
        
        {/* Chart Preview */}
        <ChartPreview babyId={babyId} />
        
        {/* Activity Feed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <ActivityFeed babyId={babyId} />
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Quick Entry Modal */}
      <QuickEntryModal 
        babyId={babyId} 
        isOpen={showQuickEntry} 
        onClose={() => setShowQuickEntry(false)}
        defaultTab={quickActionType}
      />
    </div>
  );
}