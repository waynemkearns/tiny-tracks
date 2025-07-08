import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, addDays } from "date-fns";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import BottomNavigation from "@/components/bottom-navigation";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { Feed, Nappy, SleepSession, HealthRecord } from "@shared/schema";

export default function Export() {
  const [, navigate] = useLocation();
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [includeFeeds, setIncludeFeeds] = useState(true);
  const [includeNappies, setIncludeNappies] = useState(true);
  const [includeSleep, setIncludeSleep] = useState(true);
  const [includeHealth, setIncludeHealth] = useState(true);
  
  const { toast } = useToast();
  const babyId = 1; // Demo baby ID

  const { data: baby } = useQuery({
    queryKey: [`/api/babies/${babyId}`],
  });

  const { data: feeds = [] } = useQuery<Feed[]>({
    queryKey: [`/api/babies/${babyId}/feeds`],
    enabled: includeFeeds,
  });

  const { data: nappies = [] } = useQuery<Nappy[]>({
    queryKey: [`/api/babies/${babyId}/nappies`],
    enabled: includeNappies,
  });

  const { data: sleepSessions = [] } = useQuery<SleepSession[]>({
    queryKey: [`/api/babies/${babyId}/sleep`],
    enabled: includeSleep,
  });

  const { data: healthRecords = [] } = useQuery<HealthRecord[]>({
    queryKey: [`/api/babies/${babyId}/health`],
    enabled: includeHealth,
  });

  const filterDataByDateRange = (data: any[], dateField: string) => {
    const start = new Date(startDate);
    const end = addDays(new Date(endDate), 1); // Include the end date
    
    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= start && itemDate < end;
    });
  };

  const generateReportData = () => {
    const filteredFeeds = filterDataByDateRange(feeds, 'timestamp');
    const filteredNappies = filterDataByDateRange(nappies, 'timestamp');
    const filteredSleep = filterDataByDateRange(sleepSessions, 'startTime');
    const filteredHealth = filterDataByDateRange(healthRecords, 'timestamp');

    return {
      baby: baby?.name || 'Baby',
      dateRange: `${format(new Date(startDate), 'MMM dd, yyyy')} - ${format(new Date(endDate), 'MMM dd, yyyy')}`,
      feeds: filteredFeeds,
      nappies: filteredNappies,
      sleepSessions: filteredSleep,
      healthRecords: filteredHealth,
      summary: {
        totalFeeds: filteredFeeds.length,
        totalNappies: filteredNappies.length,
        totalSleepTime: filteredSleep.reduce((total, session) => total + (session.duration || 0), 0),
        averageFeedsPerDay: Math.round(filteredFeeds.length / Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))),
      }
    };
  };

  const exportAsJSON = () => {
    const data = generateReportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `baby-wellness-report-${startDate}-to-${endDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: "Report exported successfully!" });
  };

  const exportAsCSV = () => {
    const data = generateReportData();
    let csvContent = "Type,Date,Time,Details\n";
    
    if (includeFeeds) {
      data.feeds.forEach(feed => {
        const date = format(new Date(feed.timestamp), 'yyyy-MM-dd');
        const time = format(new Date(feed.timestamp), 'HH:mm');
        const details = feed.type === 'bottle' ? `${feed.amount}ml bottle` : `${feed.duration}min ${feed.type}`;
        csvContent += `Feed,${date},${time},"${details}"\n`;
      });
    }
    
    if (includeNappies) {
      data.nappies.forEach(nappy => {
        const date = format(new Date(nappy.timestamp), 'yyyy-MM-dd');
        const time = format(new Date(nappy.timestamp), 'HH:mm');
        csvContent += `Nappy,${date},${time},"${nappy.type}"\n`;
      });
    }
    
    if (includeSleep) {
      data.sleepSessions.forEach(sleep => {
        const date = format(new Date(sleep.startTime), 'yyyy-MM-dd');
        const time = format(new Date(sleep.startTime), 'HH:mm');
        const duration = sleep.duration ? `${Math.round(sleep.duration)}min` : 'ongoing';
        csvContent += `Sleep,${date},${time},"${sleep.type} - ${duration}"\n`;
      });
    }
    
    if (includeHealth) {
      data.healthRecords.forEach(health => {
        const date = format(new Date(health.timestamp), 'yyyy-MM-dd');
        const time = format(new Date(health.timestamp), 'HH:mm');
        csvContent += `Health,${date},${time},"${health.type}: ${health.value || 'N/A'}"\n`;
      });
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `baby-wellness-report-${startDate}-to-${endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: "CSV report exported successfully!" });
  };

  const shareReport = async () => {
    const data = generateReportData();
    const reportText = `
Baby Wellness Report - ${data.baby}
${data.dateRange}

Summary:
• Total Feeds: ${data.summary.totalFeeds}
• Total Nappies: ${data.summary.totalNappies}
• Total Sleep: ${Math.round(data.summary.totalSleepTime / 60)}h ${data.summary.totalSleepTime % 60}m
• Average feeds per day: ${data.summary.averageFeedsPerDay}

Generated by Baby Wellness Tracker
    `.trim();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Baby Wellness Report - ${data.baby}`,
          text: reportText,
        });
        toast({ title: "Report shared successfully!" });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(reportText).then(() => {
        toast({ title: "Report copied to clipboard!" });
      });
    }
  };

  const reportData = generateReportData();

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
      {/* Header */}
      <header className="bg-primary text-white p-4 flex items-center">
        <Button variant="ghost" size="icon" className="text-white mr-3" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Export Data</h1>
      </header>

      <div className="p-4 space-y-6">
        {/* Date Range Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Date Range</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Data to Include</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="feeds"
                checked={includeFeeds}
                onCheckedChange={setIncludeFeeds}
              />
              <Label htmlFor="feeds">Feeding records</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="nappies"
                checked={includeNappies}
                onCheckedChange={setIncludeNappies}
              />
              <Label htmlFor="nappies">Nappy changes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sleep"
                checked={includeSleep}
                onCheckedChange={setIncludeSleep}
              />
              <Label htmlFor="sleep">Sleep sessions</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="health"
                checked={includeHealth}
                onCheckedChange={setIncludeHealth}
              />
              <Label htmlFor="health">Health records</Label>
            </div>
          </CardContent>
        </Card>

        {/* Report Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Report Summary</CardTitle>
            <p className="text-sm text-gray-600">{reportData.dateRange}</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total Feeds</p>
                <p className="text-2xl font-bold text-blue-600">{reportData.summary.totalFeeds}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Nappies</p>
                <p className="text-2xl font-bold text-yellow-600">{reportData.summary.totalNappies}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Sleep</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(reportData.summary.totalSleepTime / 60)}h
                </p>
              </div>
              <div>
                <p className="text-gray-600">Avg Feeds/Day</p>
                <p className="text-2xl font-bold text-green-600">{reportData.summary.averageFeedsPerDay}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={exportAsJSON} className="w-full" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export as JSON
            </Button>
            <Button onClick={exportAsCSV} className="w-full" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>
            <Button onClick={shareReport} className="w-full">
              <Share2 className="h-4 w-4 mr-2" />
              Share Report
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}
