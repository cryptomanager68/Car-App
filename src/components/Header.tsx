import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Minus, Maximize2, Minimize2, X, Car } from "lucide-react";
import { UserPanel } from "@/components/UserPanel";
import { Car as CarType } from "@/data/cars";
import { useState } from "react";

interface HeaderProps {
  favorites: CarType[];
  onRemoveFavorite: (carId: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

declare global {
  interface Window {
    electronAPI?: {
      closeApp: () => void;
      minimizeApp: () => void;
      toggleMaximize: () => void;
    };
  }
}

export function Header({ favorites, onRemoveFavorite, searchValue, onSearchChange }: HeaderProps) {
  const [isMaximized, setIsMaximized] = useState(true);

  const handleToggleMaximize = () => {
    window.electronAPI?.toggleMaximize();
    setIsMaximized((prev) => !prev);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/10"
      style={{
        background: "linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(30,41,80,0.92) 50%, rgba(15,23,42,0.92) 100%)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 1px 0 rgba(255,255,255,0.06), 0 4px 32px rgba(37,99,235,0.15)",
      }}
    >
      {/* Top accent line — animated gradient */}
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: "linear-gradient(90deg, transparent 0%, #3b82f6 25%, #8b5cf6 50%, #06b6d4 75%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 3s linear infinite",
        }}
      />

      <div className="flex items-center justify-between h-14 px-5 gap-4">

        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
          >
            <Car className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-bold text-sm tracking-widest text-white/90 uppercase hidden sm:block">
            DriveHub
          </span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-400/70 group-focus-within:text-blue-400 transition-colors z-10" />
          <Input
            placeholder="Search make, model, or keyword..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-sm border-0 text-white/90 placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-blue-500/50 transition-all"
            style={{
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(8px)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px rgba(255,255,255,0.08)",
            }}
          />
          {/* glow on focus */}
          <div className="absolute inset-0 rounded-md opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"
            style={{ boxShadow: "0 0 16px rgba(59,130,246,0.25)" }}
          />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1 shrink-0">
          {/* User panel */}
          <div className="mr-1">
            <UserPanel favorites={favorites} onRemoveFavorite={onRemoveFavorite} />
          </div>

          {/* Divider */}
          {window.electronAPI && (
            <div className="w-px h-5 mx-1 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
          )}

          {/* Window controls */}
          {window.electronAPI && (
            <div className="flex items-center gap-0.5">
              {/* Minimize */}
              <button
                onClick={() => window.electronAPI?.minimizeApp()}
                aria-label="Minimize"
                className="win-btn group/btn relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{ color: "rgba(255,255,255,0.5)" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.9)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)";
                }}
              >
                <Minus className="h-3.5 w-3.5" />
              </button>

              {/* Maximize / Restore */}
              <button
                onClick={handleToggleMaximize}
                aria-label={isMaximized ? "Restore" : "Maximize"}
                className="win-btn w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{ color: "rgba(255,255,255,0.5)" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.9)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)";
                }}
              >
                {isMaximized
                  ? <Minimize2 className="h-3.5 w-3.5" />
                  : <Maximize2 className="h-3.5 w-3.5" />}
              </button>

              {/* Close */}
              <button
                onClick={() => window.electronAPI?.closeApp()}
                aria-label="Close"
                className="win-btn w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{ color: "rgba(255,255,255,0.5)" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.25)";
                  (e.currentTarget as HTMLElement).style.color = "#f87171";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 0 12px rgba(239,68,68,0.3)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </header>
  );
}
