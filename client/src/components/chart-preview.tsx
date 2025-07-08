import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { Button } from "@/components/ui/button";

interface ChartPreviewProps {
  babyId: number;
}

export default function ChartPreview({ babyId }: ChartPreviewProps) {
  const today = new Date();
  const weekStart = subDays(today, 6);

  const { data: weeklyStats } = useQuery({
    queryKey: [`/api/babies/${babyId}/stats/weekly/${format(weekStart, 'yyyy-MM-dd')}`],
  });

  const maxFeeds = Math.max(...(weeklyStats?.daily.map(d => d.feedCount) || [1]));
  const maxSleep = Math.max(...(weeklyStats?.daily.map(d => d.sleepDuration) || [1]));

  const renderBar = (value: number, maxValue: number, color: string, isToday = false) => {
    const height = Math.max((value / maxValue) * 64, 4);
    return (
      <div
        className={`${color} rounded-t ${isToday ? 'border-2 border-blue-500' : ''}`}
        style={{ height: `${height}px`, width: '24px' }}
      />
    );
  };

  if (!weeklyStats) {
    return (
      <section className="p-4 bg-white border-t">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">This Week's Patterns</h3>
          <Button variant="ghost" className="text-primary text-sm font-medium">
            View Charts
          </Button>
        </div>
        <div className="text-center py-8 text-gray-500">
          Loading patterns...
        </div>
      </section>
    );
  }

  return (
    <section className="p-4 bg-white border-t">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">This Week's Patterns</h3>
        <Button variant="ghost" className="text-primary text-sm font-medium">
          View Charts
        </Button>
      </div>
      
      {/* Feeding Pattern Chart Preview */}
      <div className="bg-blue-50 p-4 rounded-xl mb-3">
        <h4 className="font-medium text-blue-800 mb-2">Feeding Pattern</h4>
        <div className="flex items-end justify-between space-x-1 h-16">
          {weeklyStats.daily.map((day, index) => {
            const isToday = index === 6;
            return <div key={`feed-${day.date}`}>{renderBar(day.feedCount, maxFeeds, 'bg-blue-400', isToday)}</div>;
          })}
        </div>
        <div className="flex justify-between text-xs text-blue-600 mt-1">
          {weeklyStats.daily.map((day) => (
            <span key={day.date}>
              {format(new Date(day.date), 'EEE').substring(0, 3)}
            </span>
          ))}
        </div>
      </div>
      
      {/* Sleep Pattern Chart Preview */}
      <div className="bg-purple-50 p-4 rounded-xl">
        <h4 className="font-medium text-purple-800 mb-2">Sleep Duration</h4>
        <div className="flex items-end justify-between space-x-1 h-16">
          {weeklyStats.daily.map((day, index) => {
            const isToday = index === 6;
            const sleepHours = day.sleepDuration / 60;
            return <div key={`sleep-${day.date}`}>{renderBar(sleepHours, maxSleep / 60, 'bg-purple-400', isToday)}</div>;
          })}
        </div>
        <div className="flex justify-between text-xs text-purple-600 mt-1">
          {weeklyStats.daily.map((day) => (
            <span key={day.date}>
              {format(new Date(day.date), 'EEE').substring(0, 3)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
