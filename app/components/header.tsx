// components/header.tsx
"use client";
import { Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-4 z-10">
      {/* Left: Menu + Title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          className="text-white bg-neutral-800 p-2 rounded hover:bg-neutral-700 transition"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-3xl font-bold text-[#4f46e5]">Notes</h1>
      </div>
      {/* Center: Search Bar */}
      <div className="flex-grow flex justify-center">
        <input
          type="text"
          placeholder="Search"
          className="border border-neutral-700 px-4 py-2 rounded-lg w-full max-w-2xl bg-neutral-900 text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
      </div>
      {/* Optional Right Section (for future buttons) */}
      <div className="w-12" /> {/* Placeholder for alignment */}
    </header>
  );
}
