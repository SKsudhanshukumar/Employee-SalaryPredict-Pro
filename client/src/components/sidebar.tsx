import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Calculator, Database, Settings, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { icon: Gauge, label: "Dashboard", href: "#", active: true },
  { icon: Calculator, label: "Salary Prediction", href: "#prediction" },
  { icon: BarChart3, label: "Analytics", href: "#analytics" },
  { icon: Database, label: "Data Upload", href: "#data" },
  { icon: Settings, label: "Model Settings", href: "#settings" },
];

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState("Dashboard");

  return (
    <Card className="sticky top-24">
      <CardContent className="p-6">
        <h2 className="text-lg font-inter font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <nav className="space-y-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveItem(item.label);
                }}
                className={cn(
                  "flex items-center p-3 rounded-lg transition-colors",
                  activeItem === item.label
                    ? "bg-blue-50 text-primary font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Model Status</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Linear Regression</span>
              <span className="text-xs bg-success text-white px-2 py-1 rounded">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Random Forest</span>
              <span className="text-xs bg-success text-white px-2 py-1 rounded">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Training</span>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
