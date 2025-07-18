import { useLocation } from "wouter";
import { Home, BarChart3, TrendingUp, Users, Share, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BottomNavigation() {
  const [location, navigate] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/charts", icon: BarChart3, label: "Charts" },
    { path: "/notes", icon: FileText, label: "Notes" },
    { path: "/compare", icon: Users, label: "Compare" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

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
