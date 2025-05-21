"use client"

import { Search, ChevronDown, MoreVertical, PlusCircle, Music, ArrowRightFromLine, LogOut, Share2 } from "lucide-react"
import { signOut, useSession } from "next-auth/react";
import Image from "next/image"
import { FormEvent, useEffect, useState } from "react"
import LiteYouTubeEmbed from  "react-lite-youtube-embed"
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';
import UpDownVote from "./UpDownVote";
import { Video } from "@/lib/types";
import { set } from "zod";
import { getYoutubeVideoId, isValidYoutubeURL, YOUTUBE_REGEX } from "@/lib/url";
import Toast from "typescript-toastify";

const DEFAULT_PLAYING_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
const REFRESH_INTERVAL_MS = 10 * 1000;

export default function MusicApp() {
  // State for tracks with upvotes/downvotes
  const [tracks, setTracks] = useState<Video[] | null>(null);
  const [likedTracks, setLikedTracks] = useState<Video[] | null>(null);
  const [currentPlaying, setCurrentPlaying] = useState<Video | null>(null);
  const [addUrl, setAddUrl] = useState<string | null>(null);
  const [addSongMessage, setAddSongMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const session = useSession();

  async function refreshStreams() {
    try {
      const res = await fetch("/api/streams/my", {
        method: "GET",
        credentials: "include", 
      });
      if (!res.ok) {
        console.error("Error from fetch(api/streams/my) refreshing streams:", res.status, await res.text());
        return;
      }

      const {streams: streamsThisUser} = await res.json();
      console.log(streamsThisUser);
      setTracks(streamsThisUser);
      
    } catch (error) {
      console.error("Failed to refresh streams:", error);
    }
}

  useEffect(() => {
    refreshStreams();
    // setInterval(() => {
    //   refreshStreams();
    // }, REFRESH_INTERVAL_MS);
  }, []);



  // Handle upvote
  const handleUpvote = async (id: string) => {
    if (!tracks || tracks.length === 0) {
      return;
    }
    const likedTrackIndex = tracks.findIndex((track) => track.id === id);
    const isAlreadyLiked = tracks[likedTrackIndex].hasUpvoted;
    console.log("inside handleupvote, upvote received for ", id," with index ",likedTrackIndex);
    console.log("isalreadyliked for current upvoted ", isAlreadyLiked);
    // if (!isAlreadyLiked) {
      const res = await fetch("/api/streams/upvote", {
        method: "POST",
        body: JSON.stringify({streamId: id})
      });
      const data = await res.json();
      setTracks((prevTracks) => {
        const copy = prevTracks;
        if (copy) copy[likedTrackIndex].hasUpvoted = true;
        return copy;
      });
    // }

    // const likedTrack = tracks[likedTrackIndex];
    // const isAlreadyLiked = likedTrack && likedTrack.hasLiked;
    // if (likedTrack && !isAlreadyLiked) {
    //   setLikedTracks((prevLiked) => {
    //     const copy = prevLiked;
    //     copy?.push(likedTrack);
    //     return copy;
    //   });
    // }
  }

  // Handle downvote
  const handleDownvote = async (id: string) => {
    if (!tracks || tracks.length === 0) {
      return;
    }
    const dislikedTrackIndex = tracks.findIndex((track) => track.id === id);
    const isAlreadyLiked = tracks[dislikedTrackIndex].hasUpvoted;

    // if (isAlreadyLiked) {
      const res = await fetch("/api/streams/downvote", {
        method: "POST",
        body: JSON.stringify({streamId: id})
      });
      const data = await res.json();
      setTracks((prevTracks) => {
        const copy = prevTracks;
        if (copy) copy[dislikedTrackIndex].hasUpvoted = false;
        return copy;
      });
    // }
  }

  
  const handlePlayNext = () => {
    if (!tracks) return;
    const nextVideo = tracks[0];
    setTracks((prev) => {
      const copy = prev;
      if (copy) copy.shift();
      return copy;
    });
    setCurrentPlaying(nextVideo); 
  }

  const addNewSong = async (e : FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const newSongURL = addUrl ?? "";
    if (!isValidYoutubeURL(newSongURL)) {
      setAddSongMessage("Not a valid YouTube URL");
      setAddUrl("");
      setLoading(false);
      setTimeout(() => setAddSongMessage(null) ,2000); 
      return;
    }

    // if (uniqueTitles?.has(title)) {
    //   console.log("Video already in queue");
    //   setLoading(false);
    //   return;
    // }
    // setUniqueTitles((prev) => {
    //   const copy = prev ?? new Set([]);
    //   copy.add(title);
    //   return copy;
    // });
    
    const res = await fetch("/api/streams", {
      method: "POST",
      body: JSON.stringify({url: newSongURL, creatorId: session.data?.user._id})
    });
    if (!res.ok){
      setAddSongMessage("Track already exists in this space.");
      setAddUrl("");
      setLoading(false);
      setTimeout(() => setAddSongMessage(null) ,2000); 
      return;
    }

    const newStream = await res.json();
    if (tracks) setTracks([...tracks, newStream]);
    else setTracks(newStream);

    setAddSongMessage("Track added!");
    setAddUrl("");
    setLoading(false);
    setTimeout(() => setAddSongMessage(null) ,2000); 
  }

  const handleShare = async () => {
    const urlCopiedToClipboard = `${window.location.hostname}/creator/${session.data?.user._id}`;
    await navigator.clipboard.writeText(urlCopiedToClipboard).then(() => {
      new Toast({
        position: "top-right",
        toastMsg: "Link copied to clipboard!",
        autoCloseTime: 2000,
        canClose: true,
        showProgress: true,
        pauseOnHover: true,
        pauseOnFocusLoss: true,
        type: "success",
        theme: "light"
      })
    }, (err) => {
      console.log("error while copying link to clipboard ", err);
      new Toast({
        position: "top-right",
        toastMsg: "Failed to copy link to clipboard. Try Again!",
        autoCloseTime: 2000,
        canClose: true,
        showProgress: true,
        pauseOnHover: true,
        pauseOnFocusLoss: true,
        type: "error",
        theme: "light"
      })
    });
  }
  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Main content area */}
      <div className=" grid grid-cols-12  h-screen overflow-hidden">
        {/* Main content */}
        <div className=" col-span-8 flex-1 overflow-y-auto p-6 bg-zinc-950">
          {/* Header */}
          <div className="flex items-center mb-6">
            <div className="flex flex-row justify-between items-center w-full">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white rounded-full"></div>
                <h1 className="text-xl font-semibold">muzi</h1>
              </div>
              {/* Share current space*/}
              <button className="hover:bg-zinc-800 p-1 rounded">
                <Share2 
                  onClick={() => handleShare()}
                  size={19}
                />
            </button>

            </div>
          </div>

          {/* Search bar and Add to playlist button */}
          <form className="flex gap-4 mb-4" onSubmit={addNewSong} >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                name="url"
                value={addUrl ?? ""}
                onChange={(e) => setAddUrl(e.target.value)}
                placeholder="The feeling of riding a horse through an apocalyptic desert..."
                className="w-full bg-zinc-900 rounded-md py-2 pl-10 pr-4 text-sm text-zinc-300 placeholder-zinc-500 border-none focus:outline-none focus:ring-1 focus:ring-zinc-700"
              />
            </div>
            <button 
              disabled={loading}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-md text-sm"   
              type="submit"
            >
              <PlusCircle className="h-4 w-4" />
              {loading? "Adding..." : "Add to playlist"}
            </button>
          </form>

          {/* youtube embed*/}
          {
            addUrl && isValidYoutubeURL(addUrl) && !loading &&
            <div>
              <div className="mt-3"><h4>Preview</h4></div>
              <div className="w-100 aspect-video bg-zinc-800 rounded-md overflow-hidden">
                <LiteYouTubeEmbed 
                  id= {getYoutubeVideoId(addUrl)}
                  title="Random title"
                />
              </div>
            </div>
          }

          {
            addSongMessage && 
              <div className="my-3 text-center text-xs text-zinc-500">
                {addSongMessage}
              </div>
          }
          
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
            <div className="col-span-7">TITLES ({initialTracks.length}+)</div>
            <div className="col-span-2 text-center">UPVOTES</div>
            <div className="col-span-2 text-center">DURATION</div>
            <div className="col-span-1 text-center">PLATFORM</div>
          </div>

          {/* Track list */}
          {(!tracks || tracks.length === 0) &&
            <div className="text-center text-xs text-zinc-500">
                No songs in the playlist...
            </div>
          }  
          { tracks && tracks?.length > 0 &&
          <div className="space-y-2">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="grid grid-cols-12 items-center py-2 px-2 rounded-md hover:bg-zinc-900/50 group"
              >
                <div className="col-span-7 flex items-center gap-3">
                  <div className="relative aspect-[5/3] w-12 rounded overflow-hidden bg-zinc-800">
                    <Image
                      src={track.smallImg || "/placeholder.png"}
                      alt={track.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{track.title}</div>
                    {/* {track?.subtitle && <div className="text-xs text-zinc-500">{track.subtitle}</div>} */}
                  </div>
                </div>
                <div className="col-span-2">
                  
                  <UpDownVote 
                    hasUpvoted={track.hasUpvoted}
                    upvotes= {track.upvoteCount}
                    id= {track.id}
                    handler= {track.hasUpvoted ? handleDownvote: handleUpvote}
                  />  
                </div>
                <div className="col-span-2 text-sm text-zinc-400 text-center">{"1:20"}</div>
                <div className="col-span-1 text-sm text-zinc-400 text-center">{<Music />}</div>
              </div>
            ))}
          </div>
        }
        </div>
        

        {/* Right sidebar */}
        <div className="col-span-4 bg-zinc-900 p-4 overflow-y-auto">
          <div className="space-y-4">

            <button className="hover:bg-zinc-800 p-1 rounded">
              <LogOut 
                onClick={async () => {
                  await signOut({callbackUrl: "/"});
                }}
                size={21}
              />
            </button>

            {/* YouTube embed with Now Playing text */}
            <div className="mt-6">
              <h3 
                className="my-2 bg-gradient-to-r from-pink-700 via-yellow-300 to-orange-400 inline-block text-transparent bg-clip-text"
                >Now Playing</h3>
              <h2 className="my-4">{currentPlaying?.title || "Never Gonna Give You Up"}</h2>
              <div className="aspect-video bg-zinc-800 rounded-md overflow-hidden">
                <LiteYouTubeEmbed 
                  id= {getYoutubeVideoId(currentPlaying?.url ?? DEFAULT_PLAYING_URL)}
                  title="Random title"
                />
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
              { !likedTracks && <div className="text-center text-xs text-zinc-500">No liked songs yet</div> }
              { likedTracks && 
              <h3 className="text-xs text-zinc-500 mb-3">SONGS YOU LIKED ({likedTracks.length})</h3> && 
              <div className="space-y-2">
                {likedTracks.map((track) => (
                  <div key={track.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8 rounded overflow-hidden">
                        <Image
                          src={track.bigImg || "/placeholder.png"}
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
              </div> }
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
    duration: "00:57",
    hasLiked: 0,
    url: "https://www.youtube.com/watch?v=DQdB7wFEygo"
  },
  {
    id: 2,
    title: "How to make your own google search",
    subtitle: "3",
    image: "/placeholder.png?height=40&width=40",
    upvotes: 2,
    duration: "00:57",
    hasLiked: 0,
    url: "https://www.youtube.com/watch?v=WCpimlH0Kck"
  },
  {
    id: 3,
    title: "Awesome Song 2",
    subtitle: "3",
    image: "/placeholder.png?height=40&width=40",
    upvotes: 2,
    duration: "00:57",
    hasLiked: 0,
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
