"use client";
import { cn } from "@/lib/utils";
import { StickyNote } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
}

const sidebarItems = [
  {
    icon: <StickyNote size={25} />,
    label: <span className="text-base font-medium">Notes</span>,
  },
];

export default function Sidebar({ isOpen, isCollapsed }: SidebarProps) {
  if (!isOpen) return null;

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 pt-16 h-screen transition-all duration-300 z-20",
        "bg-neutral-900/80 backdrop-blur-md",
        "border-r border-neutral-700/50",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <nav className="p-4 space-y-2 h-[calc(100vh-4rem)] overflow-y-auto">
        {sidebarItems.map((item, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center space-x-4 text-sm text-white",
              "bg-white/5 rounded-lg px-2 py-2", // Changed from hover to always active
              "transition-colors duration-200"
            )}
          >
            {item.icon}
            {!isCollapsed && <span>{item.label}</span>}
          </div>
        ))}
      </nav>
    </aside>
  );
}