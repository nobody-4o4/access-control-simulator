"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Server,
  Briefcase,
  Wifi,
  Megaphone,
  DoorOpen,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Room {
  id: string;
  nameFr: string;
  icon: any;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  stage: number;
}

export default function WelcomePage() {
  const router = useRouter();
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

  // Floor plan layout - Well structured and aligned
  const rooms: Room[] = [
    // 4th Stage: Data Center
    {
      id: "datacenter",
      nameFr: "Centre de Données",
      icon: Server,
      x: 50,
      y: 10,
      width: 45,
      height: 12,
      color: "green",
      stage: 4,
    },
    // 3rd Stage: IT
    {
      id: "it",
      nameFr: "Département IT",
      icon: Wifi,
      x: 50,
      y: 35,
      width: 45,
      height: 12,
      color: "blue",
      stage: 3,
    },
    // 2nd Stage: Direction and RH
    {
      id: "management",
      nameFr: "Direction",
      icon: Briefcase,
      x: 25,
      y: 60,
      width: 20,
      height: 12,
      color: "amber",
      stage: 2,
    },
    {
      id: "hr",
      nameFr: "Département RH",
      icon: Users,
      x: 75,
      y: 60,
      width: 20,
      height: 12,
      color: "purple",
      stage: 2,
    },
    // 1st Stage: Marketing
    {
      id: "marketing",
      nameFr: "Département Marketing",
      icon: Megaphone,
      x: 50,
      y: 85,
      width: 45,
      height: 12,
      color: "pink",
      stage: 1,
    },
  ];

  const getColorClasses = (color: string, isHovered: boolean) => {
    const colors: Record<string, { bg: string; border: string; text: string }> =
      {
        blue: {
          bg: isHovered ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.08)",
          border: "#3b82f6",
          text: "#1e40af",
        },
        purple: {
          bg: isHovered ? "rgba(168,85,247,0.15)" : "rgba(168,85,247,0.08)",
          border: "#a855f7",
          text: "#7e22ce",
        },
        green: {
          bg: isHovered ? "rgba(34,197,94,0.15)" : "rgba(34,197,94,0.08)",
          border: "#22c55e",
          text: "#15803d",
        },
        amber: {
          bg: isHovered ? "rgba(245,158,11,0.15)" : "rgba(245,158,11,0.08)",
          border: "#f59e0b",
          text: "#d97706",
        },
        pink: {
          bg: isHovered ? "rgba(236,72,153,0.15)" : "rgba(236,72,153,0.08)",
          border: "#ec4899",
          text: "#be185d",
        },
      };
    return colors[color] || colors.blue;
  };

  const stages = [
    { number: 4, label: "4ème Étage", y: 10 },
    { number: 3, label: "3ème Étage", y: 35 },
    { number: 2, label: "2ème Étage", y: 60 },
    { number: 1, label: "1er Étage", y: 85 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header - Responsive and well structured */}
      <header className="w-full bg-slate-800/80 backdrop-blur-sm border-b-2 border-slate-700/50 shadow-md z-30 sticky top-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 flex-shrink-0" />
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                Architecture de l'entreprise
              </h1>
            </div>
            <Button
              onClick={() => router.push("/syscontrol")}
              className="w-full sm:w-auto bg-slate-700/80 hover:bg-slate-600/80 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200 border border-slate-600/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Responsive container */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="h-full">
          {/* Floor Plan - Main content area */}
          <div className="bg-slate-800/50 backdrop-blur-xl border-2 border-slate-700/50 rounded-lg shadow-2xl relative overflow-hidden min-h-[500px] sm:min-h-[600px] lg:min-h-[700px]">
            {/* Floor texture */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <pattern
                    id="tiles"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <rect
                      width="40"
                      height="40"
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#tiles)" />
              </svg>
            </div>

            {/* Building structure - Corridors */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 1 }}
            >
              {/* Main vertical corridor (center) */}
              <rect
                x="47.5%"
                y="0%"
                width="5%"
                height="100%"
                fill="#334155"
                stroke="#475569"
                strokeWidth="2"
              />

              {/* Horizontal corridors between floors */}
              <rect
                x="0%"
                y="22%"
                width="100%"
                height="2%"
                fill="#334155"
                stroke="#475569"
                strokeWidth="2"
              />
              <rect
                x="0%"
                y="47%"
                width="100%"
                height="2%"
                fill="#334155"
                stroke="#475569"
                strokeWidth="2"
              />
              <rect
                x="0%"
                y="72%"
                width="100%"
                height="2%"
                fill="#334155"
                stroke="#475569"
                strokeWidth="2"
              />
            </svg>

            {/* Floor Number Labels on Plan */}
            {stages.map((stage) => (
              <div
                key={`floor-${stage.number}`}
                className="absolute left-2 sm:left-4 z-10 bg-blue-500 text-white rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 shadow-lg border-2 border-blue-600"
                style={{
                  top: `${stage.y}%`,
                  transform: "translateY(-50%)",
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-bold">
                    {stage.number}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold hidden sm:inline">
                    Étage
                  </span>
                </div>
              </div>
            ))}

            {/* Stage Labels - Mobile (Top) */}
            <div className="lg:hidden absolute top-2 left-2 right-2 z-20 flex flex-wrap gap-2">
              {stages.map((stage) => (
                <div
                  key={stage.number}
                  className="bg-slate-800/90 backdrop-blur-sm border-2 border-slate-600/50 rounded-md px-2 py-1 shadow-md"
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-[10px]">
                        {stage.number}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-white">
                      {stage.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Rooms - Well positioned and responsive */}
            <div className="absolute inset-0" style={{ zIndex: 2 }}>
              {rooms.map((room) => {
                const IconComponent = room.icon;
                const isHovered = hoveredRoom === room.id;
                const colors = getColorClasses(room.color, isHovered);

                return (
                  <div
                    key={room.id}
                    className="absolute transition-all duration-300 cursor-pointer"
                    style={{
                      left: `${room.x}%`,
                      top: `${room.y}%`,
                      width: `${room.width}%`,
                      height: `${room.height}%`,
                      transform: "translate(-50%, -50%)",
                      zIndex: isHovered ? 10 : 5,
                    }}
                    onMouseEnter={() => setHoveredRoom(room.id)}
                    onMouseLeave={() => setHoveredRoom(null)}
                  >
                    {/* Room container */}
                    <div
                      className="absolute inset-0 bg-slate-700/80 rounded-md shadow-lg transition-all duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${colors.bg} 0%, rgba(51, 65, 85, 0.8) 100%)`,
                        borderColor: colors.border,
                        borderWidth: "3px",
                        borderStyle: "solid",
                        boxShadow: isHovered
                          ? `0 8px 32px rgba(0,0,0,0.5), 0 0 16px ${colors.border}60`
                          : "0 4px 12px rgba(0,0,0,0.3)",
                        transform: isHovered ? "scale(1.05)" : "scale(1)",
                      }}
                    >
                      {/* Room number badge */}
                      <div className="absolute top-1.5 left-1.5 bg-slate-700 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm z-20">
                        {room.id.toUpperCase().slice(0, 3)}
                      </div>

                      {/* Room Content - Main area with icon and text */}
                      <div className="w-full h-full flex flex-col items-center justify-center p-1.5 sm:p-2 md:p-3 relative pr-6 sm:pr-8">
                        {/* Main icon */}
                        <div className="relative mb-1 sm:mb-2">
                          <IconComponent
                            className="relative transition-transform duration-300"
                            style={{
                              color: colors.text,
                              width: "clamp(1.5rem, 4vw, 3rem)",
                              height: "clamp(1.5rem, 4vw, 3rem)",
                              filter:
                                "drop-shadow(2px 2px 4px rgba(0,0,0,0.2))",
                              transform: isHovered
                                ? "scale(1.2) rotate(3deg)"
                                : "scale(1)",
                            }}
                          />
                        </div>

                        {/* Room name */}
                        <div
                          className="font-bold text-center leading-tight px-1.5 sm:px-2 rounded transition-all duration-300"
                          style={{
                            color: colors.text,
                            fontSize: "clamp(0.625rem, 1.5vw, 0.875rem)",
                            backgroundColor: isHovered
                              ? colors.bg
                              : "transparent",
                            textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
                          }}
                        >
                          {room.nameFr}
                        </div>
                      </div>

                      {/* Door indicator - Integrated at right edge, centered vertically */}
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10">
                        <div className="bg-slate-600 w-5 h-6 sm:w-6 sm:h-8 rounded-l-md border-2 border-slate-700 border-r-0 shadow-md flex items-center justify-center">
                          <DoorOpen className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                        </div>
                      </div>

                      {/* Hover effect */}
                      {isHovered && (
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none rounded-md"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend - Bottom Right, Responsive */}
            <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-slate-800/90 backdrop-blur-sm border-2 border-slate-600/50 rounded-lg p-2 sm:p-3 z-20 shadow-xl max-w-[160px] sm:max-w-[180px]">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b-2 border-slate-600">
                <div className="text-xs sm:text-sm font-bold text-white uppercase">
                  Légende
                </div>
              </div>
              <div className="flex flex-col gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-pink-500 rounded border border-pink-600 shadow-sm flex-shrink-0"></div>
                  <span className="text-white font-medium">Marketing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-amber-500 rounded border border-amber-600 shadow-sm flex-shrink-0"></div>
                  <span className="text-white font-medium">Direction</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-purple-500 rounded border border-purple-600 shadow-sm flex-shrink-0"></div>
                  <span className="text-white font-medium">RH</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded border border-blue-600 shadow-sm flex-shrink-0"></div>
                  <span className="text-white font-medium">IT</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded border border-green-600 shadow-sm flex-shrink-0"></div>
                  <span className="text-white font-medium">Data Center</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
