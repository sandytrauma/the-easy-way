"use client";
import Link from "next/link";
import { LayoutDashboard, Box, Settings, Zap } from "lucide-react";

const items = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI Components", href: "/dashboard/apps", icon: Zap },
  { name: "Integrations", href: "/dashboard/integrations", icon: Box },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardNav() {
  return (
    <nav className="grid items-start px-4 text-sm font-medium">
      {items.map((item) => (
        <Link key={item.name} href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
          <item.icon className="h-4 w-4" />
          {item.name}
        </Link>
      ))}
    </nav>
  );
}