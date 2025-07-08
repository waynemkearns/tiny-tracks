import { format } from "date-fns";
import { Utensils, Baby, Moon, Heart } from "lucide-react";

interface StatsOverviewProps {
  babyId: number;
  dailySummary?: {
    feedCount: number;
    nappyCount: number;
    sleepDuration: number;
    lastFeed?: string;
    lastNappy?: string;
    currentSleepSession?: any;
  };
}

export default function StatsOverview({ dailySummary }: StatsOverviewProps) {
  const formatTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "h:mm a");
  };

  const formatSleepDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <section className="p-4 bg-white">
      <h2 className="text-lg font-semibold mb-3">Today's Summary</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 p-3 rounded-xl shadow-sm">
          <div className="flex items-center space-x-2 mb-1">
            <Utensils className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Feeds</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">
            {dailySummary?.feedCount || 0}
          </p>
          <p className="text-xs text-blue-600">
            Last: {formatTime(dailySummary?.lastFeed)}
          </p>
        </div>
        
        <div className="bg-yellow-50 p-3 rounded-xl shadow-sm">
          <div className="flex items-center space-x-2 mb-1">
            <Baby className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Nappies</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900">
            {dailySummary?.nappyCount || 0}
          </p>
          <p className="text-xs text-yellow-600">
            Last: {formatTime(dailySummary?.lastNappy)}
          </p>
        </div>
        
        <div className="bg-purple-50 p-3 rounded-xl shadow-sm">
          <div className="flex items-center space-x-2 mb-1">
            <Moon className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Sleep</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">
            {dailySummary?.sleepDuration ? formatSleepDuration(dailySummary.sleepDuration) : "0m"}
          </p>
          <p className="text-xs text-purple-600">
            Currently: {dailySummary?.currentSleepSession ? "Sleeping" : "Awake"}
          </p>
        </div>
        
        <div className="bg-green-50 p-3 rounded-xl shadow-sm">
          <div className="flex items-center space-x-2 mb-1">
            <Heart className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Mood</span>
          </div>
          <p className="text-2xl font-bold text-green-900">😊</p>
          <p className="text-xs text-green-600">Happy & Alert</p>
        </div>
      </div>
    </section>
  );
}
