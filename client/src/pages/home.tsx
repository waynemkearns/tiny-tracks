import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Baby, Cat, Menu } from "lucide-react";
import StatsOverview from "@/components/stats-overview";
import ActivityFeed from "@/components/activity-feed";
import ChartPreview from "@/components/chart-preview";
import QuickEntryModal from "@/components/quick-entry-modal";
import BottomNavigation from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  
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

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      {/* Header */}
      <header className="bg-primary text-white p-4 flex items-center justify-between">
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
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
          <Menu className="h-5 w-5" />
        </Button>
      </header>

      {/* Quick Stats Overview */}
      <StatsOverview babyId={babyId} dailySummary={dailySummary} />

      {/* Quick Entry Section */}
      <section className="p-4 bg-gray-50">
        <h3 className="text-lg font-semibold mb-3">Quick Entry</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button
            onClick={() => setShowQuickEntry(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white p-4 h-auto flex flex-col items-center space-y-2"
          >
            <Cat className="h-6 w-6" />
            <span className="text-sm font-medium">Feed</span>
          </Button>
          <Button
            onClick={() => setShowQuickEntry(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white p-4 h-auto flex flex-col items-center space-y-2"
          >
            <Baby className="h-6 w-6" />
            <span className="text-sm font-medium">Nappy</span>
          </Button>
          <Button
            onClick={() => setShowQuickEntry(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white p-4 h-auto flex flex-col items-center space-y-2"
          >
            <Baby className="h-6 w-6" />
            <span className="text-sm font-medium">Sleep</span>
          </Button>
          <Button
            onClick={() => setShowQuickEntry(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white p-4 h-auto flex flex-col items-center space-y-2"
          >
            <Baby className="h-6 w-6" />
            <span className="text-sm font-medium">Health</span>
          </Button>
        </div>
      </section>

      {/* Recent Activity Feed */}
      <ActivityFeed babyId={babyId} />

      {/* Data Visualization Preview */}
      <ChartPreview babyId={babyId} />

      {/* Floating Action Button */}
      <Button
        onClick={() => setShowQuickEntry(true)}
        className="fixed bottom-20 right-4 bg-primary hover:bg-blue-600 text-white p-4 rounded-full shadow-lg z-10"
        size="icon"
      >
        <span className="text-xl">+</span>
      </Button>

      {/* Quick Entry Modal */}
      <QuickEntryModal
        babyId={babyId}
        isOpen={showQuickEntry}
        onClose={() => setShowQuickEntry(false)}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
