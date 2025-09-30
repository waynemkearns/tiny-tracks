import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BottomNavigation from "@/components/bottom-navigation";
import { useLocation } from "wouter";
import { WeeklyStats, StatsDaily } from "@/types/api";

export default function Charts() {
  const [, navigate] = useLocation();
  const babyId = 1; // Demo baby ID
  const today = new Date();
  const weekStart = subDays(today, 6);

  const { data: weeklyStats } = useQuery<WeeklyStats>({
    queryKey: [`/api/babies/${babyId}/stats/weekly/${format(weekStart, 'yyyy-MM-dd')}`],
    placeholderData: {
      daily: []
    }
  });

  const renderDetailedChart = (data: StatsDaily[], dataKey: keyof StatsDaily, color: string, title: string, unit: string) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d[dataKey]));

    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between space-x-2 h-32 mb-4">
            {data.map((day, index) => {
              const height = maxValue > 0 ? (day[dataKey] / maxValue) * 120 : 4;
              return (
                <div key={day.date} className="flex flex-col items-center flex-1">
                  <div className="flex flex-col justify-end h-32">
                    <div
                      className={`${color} rounded-t mx-auto`}
                      style={{ height: `${Math.max(height, 4)}px`, width: '24px' }}
                    />
                  </div>
                  <span className="text-xs mt-2 text-gray-600">
                    {format(new Date(day.date), 'EEE')}
                  </span>
                  <span className="text-xs font-medium">
                    {dataKey === 'sleepDuration' ? `${Math.round(day[dataKey] / 60)}h` : `${day[dataKey]}${unit}`}
                  </span>
                </div>
              );
            })}
          </div>
          
          <div className="text-sm text-gray-600">
            <p>Average: {
              dataKey === 'sleepDuration' 
                ? `${Math.round((data.reduce((sum, d) => sum + d[dataKey], 0) / data.length) / 60)}h` 
                : `${Math.round(data.reduce((sum, d) => sum + d[dataKey], 0) / data.length)}${unit}`
            }</p>
            <p>Total this week: {
              dataKey === 'sleepDuration' 
                ? `${Math.round(data.reduce((sum, d) => sum + d[dataKey], 0) / 60)}h` 
                : `${data.reduce((sum, d) => sum + d[dataKey], 0)}${unit}`
            }</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
      {/* Header */}
      <header className="bg-primary text-white p-4 flex items-center">
        <Button variant="ghost" size="icon" className="text-white mr-3" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Charts & Analytics</h1>
      </header>

      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">This Week's Patterns</h2>
        
        {weeklyStats ? (
          <>
            {renderDetailedChart(weeklyStats.daily, 'feedCount', 'bg-blue-500', 'Daily Feeds', '')}
            {renderDetailedChart(weeklyStats.daily, 'nappyCount', 'bg-yellow-500', 'Daily Nappies', '')}
            {renderDetailedChart(weeklyStats.daily, 'sleepDuration', 'bg-purple-500', 'Daily Sleep', '')}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Loading charts...</p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
