import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, differenceInDays, addDays } from "date-fns";
import { Baby, Calendar, Heart, Activity, Clock, ArrowUp, ArrowDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox, CheckedState } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Baby as BabyType, 
  Pregnancy, 
  Contraction, 
  FetalMovement, 
  MaternalHealth, 
  Feed, 
  Nappy, 
  SleepSession, 
  HealthRecord, 
  GrowthRecord 
} from "@/types/api";

interface UnifiedTimelineProps {
  userId: number;
  babyId?: number;
  pregnancyId?: number;
  showPregnancy?: boolean; 
  showBaby?: boolean;
}

// Types for timeline items
interface BaseTimelineItem {
  id: string | number;
  timestamp: string;
  type: string;
  source: "pregnancy" | "baby";
  icon: JSX.Element;
  color: string;
  primaryText: string;
  secondaryText?: string;
  details?: string;
}

export default function UnifiedTimeline({ 
  userId, 
  babyId,
  pregnancyId,
  showPregnancy = true,
  showBaby = true 
}: UnifiedTimelineProps) {
  const [timelineItems, setTimelineItems] = useState<BaseTimelineItem[]>([]);
  const [filterOptions, setFilterOptions] = useState({
    showPregnancy: showPregnancy,
    showBaby: showBaby,
    eventTypes: {
      contraction: true,
      movement: true,
      maternal_health: true,
      feed: true,
      nappy: true,
      sleep: true,
      health: true,
      growth: true
    }
  });
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  
  // Fetch baby data if ID provided
  const { data: baby } = useQuery<BabyType>({
    queryKey: babyId ? [`/api/babies/${babyId}`] : [],
    enabled: !!babyId
  });
  
  // Fetch pregnancy data if ID provided
  const { data: pregnancy } = useQuery<Pregnancy>({
    queryKey: pregnancyId ? [`/api/pregnancies/${pregnancyId}`] : [],
    enabled: !!pregnancyId
  });
  
  // Fetch pregnancy contractions
  const { data: contractions } = useQuery<Contraction[]>({
    queryKey: pregnancyId && filterOptions.showPregnancy ? [`/api/pregnancies/${pregnancyId}/contractions`] : [],
    enabled: !!pregnancyId && filterOptions.showPregnancy && filterOptions.eventTypes.contraction,
    placeholderData: []
  });
  
  // Fetch pregnancy movements
  const { data: movements } = useQuery<FetalMovement[]>({
    queryKey: pregnancyId && filterOptions.showPregnancy ? [`/api/pregnancies/${pregnancyId}/movements`] : [],
    enabled: !!pregnancyId && filterOptions.showPregnancy && filterOptions.eventTypes.movement,
    placeholderData: []
  });
  
  // Fetch pregnancy health data
  const { data: maternalHealth } = useQuery<MaternalHealth[]>({
    queryKey: pregnancyId && filterOptions.showPregnancy ? [`/api/pregnancies/${pregnancyId}/health`] : [],
    enabled: !!pregnancyId && filterOptions.showPregnancy && filterOptions.eventTypes.maternal_health,
    placeholderData: []
  });
  
  // Fetch baby feeds
  const { data: feeds } = useQuery<Feed[]>({
    queryKey: babyId && filterOptions.showBaby ? [`/api/babies/${babyId}/feeds`] : [],
    enabled: !!babyId && filterOptions.showBaby && filterOptions.eventTypes.feed,
    placeholderData: []
  });
  
  // Fetch baby nappies
  const { data: nappies } = useQuery<Nappy[]>({
    queryKey: babyId && filterOptions.showBaby ? [`/api/babies/${babyId}/nappies`] : [],
    enabled: !!babyId && filterOptions.showBaby && filterOptions.eventTypes.nappy,
    placeholderData: []
  });
  
  // Fetch baby sleep
  const { data: sleep } = useQuery<SleepSession[]>({
    queryKey: babyId && filterOptions.showBaby ? [`/api/babies/${babyId}/sleep`] : [],
    enabled: !!babyId && filterOptions.showBaby && filterOptions.eventTypes.sleep,
    placeholderData: []
  });
  
  // Fetch baby health
  const { data: health } = useQuery<HealthRecord[]>({
    queryKey: babyId && filterOptions.showBaby ? [`/api/babies/${babyId}/health`] : [],
    enabled: !!babyId && filterOptions.showBaby && filterOptions.eventTypes.health,
    placeholderData: []
  });
  
  // Fetch baby growth
  const { data: growth } = useQuery<GrowthRecord[]>({
    queryKey: babyId && filterOptions.showBaby ? [`/api/babies/${babyId}/growth`] : [],
    enabled: !!babyId && filterOptions.showBaby && filterOptions.eventTypes.growth,
    placeholderData: []
  });
  
  // Create combined timeline data
  useEffect(() => {
    const allItems: BaseTimelineItem[] = [];
    
    // Add pregnancy contractions
    if (contractions?.length && filterOptions.eventTypes.contraction) {
      contractions.forEach((contraction: Contraction) => {
        allItems.push({
          id: `contraction_${contraction.id}`,
          timestamp: contraction.startTime,
          type: "contraction",
          source: "pregnancy",
          icon: <Activity className="h-4 w-4" />,
          color: "bg-pink-100 text-pink-700",
          primaryText: "Contraction",
          secondaryText: contraction.duration ? `Duration: ${Math.floor(contraction.duration / 60)}m ${contraction.duration % 60}s` : "In progress",
          details: `Intensity: ${contraction.intensity}/10${contraction.notes ? ` • ${contraction.notes}` : ''}`
        });
      });
    }
    
    // Add pregnancy movements
    if (movements?.length && filterOptions.eventTypes.movement) {
      movements.forEach((movement: FetalMovement) => {
        allItems.push({
          id: `movement_${movement.id}`,
          timestamp: movement.timestamp,
          type: "movement",
          source: "pregnancy",
          icon: <Baby className="h-4 w-4" />,
          color: "bg-purple-100 text-purple-700",
          primaryText: "Fetal Movement",
          secondaryText: movement.responseToStimuli ? `Response to: ${movement.responseToStimuli}` : undefined,
          details: movement.notes
        });
      });
    }
    
    // Add maternal health data
    if (maternalHealth?.length && filterOptions.eventTypes.maternal_health) {
      maternalHealth.forEach((item: MaternalHealth) => {
        let itemTitle = "Health Record";
        let itemDetails = item.value;
        
        if (item.type === 'weight') {
          itemTitle = "Weight";
          itemDetails = `${item.value} kg`;
        } else if (item.type === 'blood_pressure') {
          itemTitle = "Blood Pressure";
        } else if (item.type === 'symptom') {
          itemTitle = `Symptom: ${item.value}`;
          const details = item.details ? JSON.parse(item.details) : {};
          if (details.severity) {
            itemDetails = `Severity: ${details.severity}/10`;
          }
        } else if (item.type === 'mood') {
          itemTitle = `Mood: ${item.value}`;
        }
        
        allItems.push({
          id: `maternal_health_${item.id}`,
          timestamp: item.timestamp,
          type: "maternal_health",
          source: "pregnancy",
          icon: <Heart className="h-4 w-4" />,
          color: "bg-red-100 text-red-700",
          primaryText: itemTitle,
          secondaryText: itemDetails,
          details: item.notes
        });
      });
    }
    
    // Add baby feeds
    if (feeds?.length && filterOptions.eventTypes.feed) {
      feeds.forEach((feed: Feed) => {
        allItems.push({
          id: `feed_${feed.id}`,
          timestamp: feed.timestamp,
          type: "feed",
          source: "baby",
          icon: <span className="text-xs">🍼</span>,
          color: "bg-blue-100 text-blue-700",
          primaryText: feed.type === 'bottle' ? "Bottle Feed" : "Breast Feed",
          secondaryText: feed.amount ? `${feed.amount}ml` : `${feed.duration || 0} min`,
          details: feed.notes
        });
      });
    }
    
    // Add baby nappies
    if (nappies?.length && filterOptions.eventTypes.nappy) {
      nappies.forEach((nappy: Nappy) => {
        allItems.push({
          id: `nappy_${nappy.id}`,
          timestamp: nappy.timestamp,
          type: "nappy",
          source: "baby",
          icon: <span className="text-xs">💩</span>,
          color: "bg-yellow-100 text-yellow-700",
          primaryText: `${nappy.type.charAt(0).toUpperCase() + nappy.type.slice(1)} Nappy`,
          details: nappy.notes
        });
      });
    }
    
    // Add baby sleep
    if (sleep?.length && filterOptions.eventTypes.sleep) {
      sleep.forEach((session: SleepSession) => {
        const duration = session.duration ? Math.round(session.duration) : 0;
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;
        const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        
        allItems.push({
          id: `sleep_${session.id}`,
          timestamp: session.startTime,
          type: "sleep",
          source: "baby",
          icon: <span className="text-xs">😴</span>,
          color: "bg-indigo-100 text-indigo-700",
          primaryText: session.type === 'nap' ? "Nap" : "Night Sleep",
          secondaryText: session.endTime ? durationText : "In progress",
          details: session.notes
        });
      });
    }
    
    // Add baby health
    if (health?.length && filterOptions.eventTypes.health) {
      health.forEach((record: HealthRecord) => {
        allItems.push({
          id: `health_${record.id}`,
          timestamp: record.timestamp,
          type: "health",
          source: "baby",
          icon: <Activity className="h-4 w-4" />,
          color: "bg-green-100 text-green-700",
          primaryText: `Health: ${record.type}`,
          secondaryText: record.value,
          details: record.notes
        });
      });
    }
    
    // Add baby growth
    if (growth?.length && filterOptions.eventTypes.growth) {
      growth.forEach((record: GrowthRecord) => {
        const details = [];
        if (record.weight) details.push(`Weight: ${record.weight} kg`);
        if (record.height) details.push(`Height: ${record.height} cm`);
        if (record.headCircumference) details.push(`Head: ${record.headCircumference} cm`);
        
        allItems.push({
          id: `growth_${record.id}`,
          timestamp: record.timestamp,
          type: "growth",
          source: "baby",
          icon: <ArrowUp className="h-4 w-4" />,
          color: "bg-emerald-100 text-emerald-700",
          primaryText: "Growth Measurement",
          secondaryText: details.join(' • '),
          details: record.notes
        });
      });
    }
    
    // Sort by timestamp (newest first)
    const sortedItems = allItems.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    
    setTimelineItems(sortedItems);
  }, [
    contractions, movements, maternalHealth, 
    feeds, nappies, sleep, health, growth,
    filterOptions.eventTypes, filterOptions.showBaby, filterOptions.showPregnancy
  ]);
  
  // Group items by date
  const groupedItems: Record<string, BaseTimelineItem[]> = {};
  timelineItems.forEach(item => {
    const date = format(new Date(item.timestamp), 'yyyy-MM-dd');
    if (!groupedItems[date]) {
      groupedItems[date] = [];
    }
    groupedItems[date].push(item);
  });
  
  // Toggle filters
  const toggleEventType = (type: string) => {
    setFilterOptions(prev => ({
      ...prev,
      eventTypes: {
        ...prev.eventTypes,
        [type]: !prev.eventTypes[type as keyof typeof prev.eventTypes]
      }
    }));
  };
  
  const toggleSource = (source: "pregnancy" | "baby") => {
    if (source === "pregnancy") {
      setFilterOptions(prev => ({ ...prev, showPregnancy: !prev.showPregnancy }));
    } else {
      setFilterOptions(prev => ({ ...prev, showBaby: !prev.showBaby }));
    }
  };
  
  // Format dates nicely
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = addDays(today, -1);
    
    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return 'Today';
    } else if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
      return 'Yesterday';
    } else {
      return format(date, 'EEEE, MMMM d');
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Timeline</h2>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Filter className="h-4 w-4" /> Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <h3 className="font-medium">Show Events</h3>
              
              <div className="space-y-2">
                {showPregnancy && (
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="show-pregnancy"
                      checked={filterOptions.showPregnancy}
                      onCheckedChange={(checked: CheckedState) => toggleSource("pregnancy")}
                    />
                    <Label htmlFor="show-pregnancy" className="text-sm">Pregnancy Events</Label>
                  </div>
                )}
                
                {showBaby && (
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="show-baby"
                      checked={filterOptions.showBaby}
                      onCheckedChange={(checked: CheckedState) => toggleSource("baby")}
                    />
                    <Label htmlFor="show-baby" className="text-sm">Baby Events</Label>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Event Types</h3>
                
                <div className="grid grid-cols-2 gap-2">
                  {showPregnancy && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="show-contractions"
                          checked={filterOptions.eventTypes.contraction}
                          onCheckedChange={(checked: CheckedState) => toggleEventType("contraction")}
                        />
                        <Label htmlFor="show-contractions" className="text-sm">Contractions</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="show-movements"
                          checked={filterOptions.eventTypes.movement}
                          onCheckedChange={(checked: CheckedState) => toggleEventType("movement")}
                        />
                        <Label htmlFor="show-movements" className="text-sm">Fetal Movements</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="show-maternal-health"
                          checked={filterOptions.eventTypes.maternal_health}
                          onCheckedChange={(checked: CheckedState) => toggleEventType("maternal_health")}
                        />
                        <Label htmlFor="show-maternal-health" className="text-sm">Maternal Health</Label>
                      </div>
                    </>
                  )}
                  
                  {showBaby && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="show-feeds"
                          checked={filterOptions.eventTypes.feed}
                          onCheckedChange={(checked: CheckedState) => toggleEventType("feed")}
                        />
                        <Label htmlFor="show-feeds" className="text-sm">Feeds</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="show-nappies"
                          checked={filterOptions.eventTypes.nappy}
                          onCheckedChange={(checked: CheckedState) => toggleEventType("nappy")}
                        />
                        <Label htmlFor="show-nappies" className="text-sm">Nappies</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="show-sleep"
                          checked={filterOptions.eventTypes.sleep}
                          onCheckedChange={(checked: CheckedState) => toggleEventType("sleep")}
                        />
                        <Label htmlFor="show-sleep" className="text-sm">Sleep</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="show-health"
                          checked={filterOptions.eventTypes.health}
                          onCheckedChange={(checked: CheckedState) => toggleEventType("health")}
                        />
                        <Label htmlFor="show-health" className="text-sm">Health</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="show-growth"
                          checked={filterOptions.eventTypes.growth}
                          onCheckedChange={(checked: CheckedState) => toggleEventType("growth")}
                        />
                        <Label htmlFor="show-growth" className="text-sm">Growth</Label>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Timeline */}
      <div className="space-y-6">
        {Object.keys(groupedItems).length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <Calendar className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No timeline events to display</p>
            <p className="text-sm text-gray-400">Try adjusting your filters</p>
          </div>
        ) : (
          Object.keys(groupedItems).map(date => (
            <div key={date} className="space-y-2">
              <div className="sticky top-0 bg-gray-50 py-2 px-3 rounded-lg font-medium text-sm flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                {formatDate(date)}
              </div>
              
              <div className="space-y-2 pl-3 border-l-2 border-gray-100">
                {groupedItems[date].map((item: BaseTimelineItem) => (
                  <div key={item.id} className="relative">
                    {/* Timeline dot */}
                    <div className={`absolute -left-[19px] w-5 h-5 rounded-full flex items-center justify-center ${item.color.split(' ')[0]}`}>
                      {item.icon}
                    </div>
                    
                    {/* Timeline card */}
                    <div 
                      className={`ml-2 p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                        expandedItem === item.id ? 'bg-gray-50 border border-gray-200' : ''
                      }`}
                      onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <Badge 
                              variant="secondary" 
                              className={`mr-2 ${item.color}`}
                            >
                              {item.source === "pregnancy" ? "Pregnancy" : "Baby"}
                            </Badge>
                            <span className="font-medium">{item.primaryText}</span>
                          </div>
                          
                          {item.secondaryText && (
                            <p className="text-sm text-gray-600 mt-1">{item.secondaryText}</p>
                          )}
                          
                          {expandedItem === item.id && item.details && (
                            <div className="mt-2 text-sm text-gray-600 bg-white p-2 rounded border border-gray-100">
                              {item.details}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          {format(new Date(item.timestamp), 'h:mm a')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
