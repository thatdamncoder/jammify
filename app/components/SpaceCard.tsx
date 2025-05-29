"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { Badge, Calendar, CirclePlay, Crown, Music, UserCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils"; // Optional: Utility for class merging
import { Space } from "@/lib/types";

const gradients = [
  "from-pink-500 to-purple-500",
  "from-blue-500 to-indigo-500",
  "from-green-400 to-emerald-500",
  "from-yellow-400 to-orange-500",
  "from-red-400 to-pink-500",
  "from-sky-400 to-blue-600",
];

function getRandomGradient() {
  return gradients[Math.floor(Math.random() * gradients.length)];
}

export default function SpaceCard({
  space,
  isCreated = false,
}: {
  space: Space;
  isCreated?: boolean;
}) {
  const gradient = getRandomGradient();

  return (
    <Link href={`/space/${space.id}`}>
      <div
        className={cn(
          `group relative cursor-pointer rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-300 ease-in-out bg-gradient-to-br ${gradient}`
        )}
      >
        {/* Illustration */}
        <img
          src={`/illustration.png`}
          alt="Illustration"
          className="h-60 w-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
        />

        {/* {space.currentSong && 
            <div className="flex justify-center items-center relative bottom-6">
            <CirclePlay size={40} color="white" />
            <span className="truncate">{space.currentSong}</span>
            </div> */}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4">
          <div className="text-white space-y-1 animate-slide-up">
            <h3 className="text-lg font-semibold">{space.title}</h3>
            <p className="text-sm opacity-90">{"NO description"}</p>

            {/* {space.currentSong && (
              <div className="flex items-center gap-2 text-sm mt-2">
                <Music className="h-4 w-4 text-pink-400" />
                <span className="font-medium">Now Playing:</span>
                <span className="truncate">{space.currentSong}</span>
              </div>
            )} */}

            <div className="mt-2 flex justify-between text-xs text-gray-300">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {/* {space.membersCount}  */ 1}
                members
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {isCreated ? `Created ${space.createdAt}` : `Joined ${space.createdAt}`}
              </div>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 z-10">
          <Badge
            className={`text-xs px-2 py-0.5 rounded-full shadow ${
              isCreated
                ? "bg-yellow-300 text-black"
                : "bg-white/20 text-white border border-white/30"
            }`}
          >
            {isCreated ? <Crown className="mr-1 h-3 w-3" /> : <UserCheck className="mr-1 h-3 w-3" />}
            {isCreated ? "Created" : "Joined"}
          </Badge>
        </div>

        <div className="absolute top-3 right-3 z-10">
          {space.isActive ? (
            <Badge className="bg-green-500 text-white border-0 text-xs px-2 py-0.5 rounded-full">
              <span className="mr-1 h-2 w-2 rounded-full bg-white inline-block" />
              Live
            </Badge>
          ) : (
            <Badge className="bg-white/20 text-white border border-white/30 text-xs px-2 py-0.5 rounded-full">
              Offline
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
