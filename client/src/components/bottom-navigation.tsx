import { useLocation } from "wouter";
import { Home, BarChart3, TrendingUp, Users, Share, User, FileText, Baby } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export default function BottomNavigation() {
  const [location, navigate] = useLocation();
  
  // Get user data to check if pregnancy mode is enabled
  // For demo purposes, we'll assume userId 1 and pregnancyMode is true
  const userId = 1;
  const { data: user } = useQuery({
    queryKey: [`/api/users/${userId}`],
    // Using placeholders for now
    placeholderData: { id: userId, username: "user", pregnancyMode: true },
  });

  // Common nav items
  const baseNavItems = [
    { path: "/notes", icon: FileText, label: "Notes" },
    { path: "/profile", icon: User, label: "Profile" },
  ];
  
  // Baby mode specific nav items
  const babyNavItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/charts", icon: BarChart3, label: "Charts" },
    { path: "/compare", icon: Users, label: "Compare" },
  ];
  
  // Pregnancy mode specific nav items
  const pregnancyNavItems = [
    { path: "/pregnancy", icon: Baby, label: "Pregnancy" },
    { path: "/pregnancy/health", icon: TrendingUp, label: "Health" },
  ];

  // Use pregnancy mode if enabled, otherwise use baby mode
  const modeSpecificItems = user?.pregnancyMode ? pregnancyNavItems : babyNavItems;
  
  // Combine the nav items
  const navItems = [...modeSpecificItems, ...baseNavItems];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-w-md mx-auto">
      <div className="flex">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Button
            key={path}
            variant="ghost"
            className={`flex-1 flex flex-col items-center py-2 px-1 h-auto ${
              location === path ? "text-primary" : "text-gray-400"
            }`}
            onClick={() => navigate(path)}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs mt-1">{label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
}
