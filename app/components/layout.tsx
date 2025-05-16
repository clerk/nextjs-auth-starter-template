// components/shell.tsx
"use client";

import { useState } from "react";
import Header from "./header";
import Sidebar from "./sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    if (isSidebarOpen) {
      setIsCollapsed(!isCollapsed);
    } else {
      setIsSidebarOpen(true);
      setIsCollapsed(false);
    }
  };

  return (
    <div className="flex bg-neutral-950 text-white min-h-screen">
      <Sidebar isOpen={isSidebarOpen} isCollapsed={isCollapsed} />
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          isSidebarOpen ? (isCollapsed ? "ml-20" : "ml-64") : ""
        }`}
      >
        <Header onMenuClick={toggleSidebar} />
        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-4xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}