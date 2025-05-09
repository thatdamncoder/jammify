"use client"

import { Search, ChevronDown, MoreVertical, PlusCircle, Music, ArrowRightFromLine, ChevronUp } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

const YOUTUBE_EMBED_BASE_URL = "https://www.youtube.com/embed/";
const DEFAULT_PLAYING_ID = "dQw4w9WgXcQ";

export default function MusicApp() {
  // State for tracks with upvotes/downvotes
  const [tracks, setTracks] = useState(initialTracks.sort((a, b) => b.upvotes - a.upvotes));
  const [likedTracks, setLikedTracks] = useState(likedTracksList);
  const [currentPlaying, setCurrentPlaying] = useState(DEFAULT_PLAYING_ID);

  // Handle upvote
  const handleUpvote = (id: number) => {
    const likedTrack = tracks.find((track) => track.id === id);
    if (likedTrack) {
      const { id: likedId, title: likedTitle, image: likedImage} : {id: number, title: string, image: string} = likedTrack;
      setLikedTracks((prevLiked) => (
        [{id: likedId, title: likedTitle, image: likedImage}, ...prevLiked]
      ));
    }

    setTracks(
      tracks
        .map((track) => (track.id === id ? { ...track, upvotes: track.upvotes + 1 } : track))
        .sort((a, b) => b.upvotes - a.upvotes),
    )
  }

  // Handle downvote
  const handleDownvote = (id: number) => {
    setTracks(
      tracks
        .map((track) => (track.id === id ? { ...track, downvotes: track.downvotes + 1 } : track))
        .sort((a, b) => b.upvotes - a.upvotes),
    )
  }

  
  const handlePlayNext = () => {
    const {url : nextToBePlayed} = tracks[0];
    const extracted_id = nextToBePlayed.split("v=?")[1];
    setTracks((prev) => {
      prev.shift();
      return prev;
    });
    setCurrentPlaying(extracted_id);
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6 bg-zinc-950">
          {/* Header */}
          <div className="flex items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white rounded-full"></div>
              <h1 className="text-xl font-semibold">muzi</h1>
            </div>
          </div>

          {/* Search bar and Add to playlist button */}
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="The feeling of riding a horse through an apocalyptic desert..."
                className="w-full bg-zinc-900 rounded-md py-2 pl-10 pr-4 text-sm text-zinc-300 placeholder-zinc-500 border-none focus:outline-none focus:ring-1 focus:ring-zinc-700"
              />
            </div>
            <button className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-md text-sm">
              <PlusCircle className="h-4 w-4" />
              Add to playlist
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-4 mb-6 text-sm text-zinc-400 border-b border-zinc-800 pb-2">
            <button className="px-2 py-1">Moods</button>
            <button className="px-2 py-1">Qualities</button>
            <button className="px-2 py-1">Genre</button>
            <button className="px-2 py-1">Instruments</button>
            <button className="px-2 py-1">Vocals</button>
            <button className="px-2 py-1">Tempo</button>
            <button className="px-2 py-1">Shape</button>
            <button className="px-2 py-1">Brief</button>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-12 text-xs text-zinc-500 uppercase mb-2 px-2">
            <div className="col-span-5">TITLES ({initialTracks.length}+)</div>
            <div className="col-span-2 text-center">UPVOTES</div>
            <div className="col-span-2 text-center">DOWNVOTES</div>
            <div className="col-span-2 text-center">DURATION</div>
            <div className="col-span-1 text-center">PLATFORM</div>
          </div>

          {/* Track list */}
          <div className="space-y-2">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="grid grid-cols-12 items-center py-2 px-2 rounded-md hover:bg-zinc-900/50 group"
              >
                <div className="col-span-5 flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded overflow-hidden">
                    <Image
                      src={track.image || "/placeholder.png"}
                      alt={track.title}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{track.title}</div>
                    {track.subtitle && <div className="text-xs text-zinc-500">{track.subtitle}</div>}
                  </div>
                </div>
                <div className="col-span-2 text-center">
                  <button
                    onClick={() => handleUpvote(track.id)}
                    className="flex items-center justify-center gap-1 mx-auto hover:bg-zinc-800 p-1 rounded"
                  >
                    <ChevronUp className="h-4 w-4 text-zinc-400" />
                    <span className="text-sm text-zinc-400">{track.upvotes}</span>
                  </button>
                </div>
                <div className="col-span-2 text-center">
                  <button
                    onClick={() => handleDownvote(track.id)}
                    className="flex items-center justify-center gap-1 mx-auto hover:bg-zinc-800 p-1 rounded"
                  >
                    <ChevronDown className="h-4 w-4 text-zinc-400" />
                    <span className="text-sm text-zinc-400 text-center">{track.downvotes}</span>
                  </button>
                </div>
                <div className="col-span-2 text-sm text-zinc-400 text-center">{track.duration}</div>
                <div className="col-span-1 text-sm text-zinc-400 text-center">{<Music />}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-100 bg-zinc-900 p-4 overflow-y-auto">
          <div className="space-y-4">
    
            {/* YouTube embed with Now Playing text */}
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Now Playing</h3>
              <div className="aspect-video bg-zinc-800 rounded-md overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  src={YOUTUBE_EMBED_BASE_URL + currentPlaying}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>

            <div className="flex flex-row justify-center bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-md text-sm">
              <button 
                className="text-center flex flex-row justify-center gap-2"
                onClick={() => handlePlayNext()}
              >  
                  Play Next {<ArrowRightFromLine size={23}/>}
              </button>   
            </div>
            <div className="mt-6">
              <h3 className="text-xs text-zinc-500 mb-3">SONGS YOU LIKED ({likedTracks.length})</h3>
              <div className="space-y-2">
                {likedTracks.map((track) => (
                  <div key={track.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8 rounded overflow-hidden">
                        <Image
                          src={track.image || "/placeholder.png"}
                          alt={track.title}
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                      <div className="text-sm">{track.title}</div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100">
                      <MoreVertical className="h-4 w-4 text-zinc-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Sample data with upvotes and downvotes
const initialTracks = [
  {
    id: 1,
    title: "The Only Docker Tutorial You Need To Get Started",
    subtitle: "3",
    image: "/placeholder.png?height=40&width=40",
    upvotes: 2,
    downvotes: 1,
    duration: "00:57",
    url: "https://www.youtube.com/watch?v=DQdB7wFEygo"
  },
  {
    id: 2,
    title: "How to make your own google search",
    subtitle: "3",
    image: "/placeholder.png?height=40&width=40",
    upvotes: 2,
    downvotes: 1,
    duration: "00:57",
    url: "https://www.youtube.com/watch?v=WCpimlH0Kck"
  },
  {
    id: 2,
    title: "Awesome Song 2",
    subtitle: "3",
    image: "/placeholder.png?height=40&width=40",
    upvotes: 2,
    downvotes: 1,
    duration: "00:57",
    url: "https://www.youtube.com/watch?v=NwZ26lxl8wU"
  }
]

const likedTracksList = [
  {
    id: 0,
    title: "Tin Roof (Original)",
    image: "/placeholder.png?height=32&width=32",
  }
]
