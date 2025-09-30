import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Utensils, Baby, Moon, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Feed, Nappy, SleepSession } from "@/types/api";

interface ActivityFeedProps {
  babyId: number;
}

type ActivityItem = {
  id: number;
  type: 'feed' | 'nappy' | 'sleep';
  timestamp: string;
  data: Feed | Nappy | SleepSession;
};

export default function ActivityFeed({ babyId }: ActivityFeedProps) {
  const { data: feeds = [] } = useQuery<Feed[]>({
    queryKey: [`/api/babies/${babyId}/feeds`],
    select: (data) => data.slice(0, 5),
    placeholderData: []
  });

  const { data: nappies = [] } = useQuery<Nappy[]>({
    queryKey: [`/api/babies/${babyId}/nappies`],
    select: (data) => data.slice(0, 5),
    placeholderData: []
  });

  const { data: sleepSessions = [] } = useQuery<SleepSession[]>({
    queryKey: [`/api/babies/${babyId}/sleep`],
    select: (data) => data.slice(0, 5),
    placeholderData: []
  });

  // Combine and sort all activities
  const activities: ActivityItem[] = [
    ...feeds.map(feed => ({
      id: feed.id,
      type: 'feed' as const,
      timestamp: feed.timestamp,
      data: feed,
    })),
    ...nappies.map(nappy => ({
      id: nappy.id,
      type: 'nappy' as const,
      timestamp: nappy.timestamp,
      data: nappy,
    })),
    ...sleepSessions.map(sleep => ({
      id: sleep.id,
      type: 'sleep' as const,
      timestamp: sleep.startTime,
      data: sleep,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  const renderActivityItem = (activity: ActivityItem) => {
    const time = format(new Date(activity.timestamp), "h:mm a");
    
    switch (activity.type) {
      case 'feed': {
        const feed = activity.data as Feed;
        return (
          <div key={`feed-${activity.id}`} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="bg-blue-100 p-2 rounded-full">
              <Utensils className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{feed.type === 'bottle' ? 'Bottle Feed' : 'Breast Feed'}</p>
              <p className="text-sm text-gray-600">
                {feed.amount ? `${feed.amount}ml` : `${feed.duration || 0} min`} • {time}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="text-gray-400">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        );
      }
      
      case 'nappy': {
        const nappy = activity.data as Nappy;
        return (
          <div key={`nappy-${activity.id}`} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="bg-yellow-100 p-2 rounded-full">
              <Baby className="h-4 w-4 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{nappy.type.charAt(0).toUpperCase() + nappy.type.slice(1)} Nappy</p>
              <p className="text-sm text-gray-600">{time}</p>
            </div>
            <Button variant="ghost" size="icon" className="text-gray-400">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        );
      }
      
      case 'sleep': {
        const sleep = activity.data as SleepSession;
        const duration = sleep.duration ? Math.round(sleep.duration) : 0;
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;
        const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        
        return (
          <div key={`sleep-${activity.id}`} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="bg-purple-100 p-2 rounded-full">
              <Moon className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{sleep.type === 'nap' ? 'Nap' : 'Night Sleep'}</p>
              <p className="text-sm text-gray-600">
                {sleep.endTime ? durationText : 'In progress'} • {time}
                {sleep.endTime && ` - ${format(new Date(sleep.endTime), "h:mm a")}`}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="text-gray-400">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        );
      }
      
      default:
        return null;
    }
  };

  return (
    <section className="p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <Button variant="ghost" className="text-primary text-sm font-medium">
          View All
        </Button>
      </div>
      
      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No activities recorded yet.</p>
            <p className="text-sm">Start tracking to see your baby's activities here!</p>
          </div>
        ) : (
          activities.map(renderActivityItem)
        )}
      </div>
    </section>
  );
}
