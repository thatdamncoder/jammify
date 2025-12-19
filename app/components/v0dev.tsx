"use client"

import { Search, ChevronDown, MoreVertical, PlusCircle, Music, ArrowRightFromLine, LogOut, Share2, CircleX, Trash, Speaker, House } from "lucide-react"
import { signOut, useSession } from "next-auth/react";
import Image from "next/image"
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"
// import LiteYouTubeEmbed from  "react-lite-youtube-embed"
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';
import UpDownVote from "./UpDownVote";
import { Video } from "@/lib/types";
import { getYoutubeVideoId, isValidYoutubeURL} from "@/lib/url";
import Toast from "typescript-toastify";
//@ts-ignore
import YouTubePlayer from 'youtube-player';
import { useSocket } from "@/hooks/useSocket";
import { useRouter } from "next/navigation";
import AlertDialogPopUp from "./AlertDialog";
import { Button } from "@/components/ui/button";

const DEFAULT_PLAYING_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
const DEFAULT_PLAYING_EXTRACTED_ID = "dQw4w9WgXcQ";
const REFRESH_INTERVAL_MS = 10 * 1000;

export default function MusicApp({spaceId}: {spaceId:string}) {
  // State for tracks with upvotes/downvotes
  const [tracks, setTracks] = useState<Video[] | null>(null);
  const [likedTracks, setLikedTracks] = useState<Video[] | null>(null);
  const [currentPlaying, setCurrentPlaying] = useState<Video | null>(null);
  const [addUrl, setAddUrl] = useState<string | null>(null);
  const [addSongMessage, setAddSongMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hoveringOnTrack, setHoveringOnTrack] = useState<string | null>(null);
  const [alertDialogOpen, setAlertDialogOpen] = useState<boolean> (false);
  const uniqueVideoIds = useMemo(() => {
    return new Set(tracks?.map((track) => track.extractedId));
  }, [tracks]);
  const videoPlayerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const tracksRef = useRef(tracks);
  const socket = useSocket();
  const router = useRouter();
  const sortQueue = (queue : Video[]) => {
    return [...queue].sort(customSortQueueComparator)
  }

  //socket
  useEffect(() => {
    if (!socket) return;
    socket.on("upvoteChanged", ({id, count, upvoted}) => {
      setTracks((prev) => {
        if (!prev) return prev;
        const copy = prev.map((track) => {
          return track.id === id? {...track, upvoteCount: count, hasUpvoted: upvoted} : track;
        });
        return copy.sort(customSortQueueComparator);
      });
    });

    socket.on("changedCurrentPlayingVideo", (nextTrack) => {
      setCurrentPlaying(nextTrack);
    });

    socket.on("updatedQueue", (queue) => {
      if (!queue) return queue;
      setTracks(sortQueue(queue));
    });
    
    socket.on("updatedQueueOnShift", (queue) => {
      setTracks(queue);
    });

    console.log("socket inside upvote changed");
    return () => {
      socket.off("upvoteChanged");
      socket.off("changedCurrentPlayingVideo");
      socket.off("updatedQueueOnShift");
      socket.off("updatedQueue");
    }
  }, [socket]);


  useEffect(() => {
    refreshStreams();
  }, []);

  useEffect(() => {
    console.log("Tracks state updated:", tracks);
    tracksRef.current = tracks;
  },[tracks]);


  // useEffect(() => {
  //   if (!videoPlayerRef.current || !currentPlaying) {
  //     return;
  //   }
  //   let player = YouTubePlayer(videoPlayerRef.current);

  //   // 'loadVideoById' is queued until the player is ready to receive API calls.
  //   player.loadVideoById(currentPlaying.extractedId);

  //   // 'playVideo' is queue until the player is ready to received API calls and after 'loadVideoById' has been called.
  //   player.playVideo();
  //   function eventHandler(event: any) {
  //     console.log(event);
  //     console.log(event.data);
  //     if (event.data === 0) {
  //       handlePlayNext();
  //     }
  //   }
  //   player.on("stateChange", eventHandler);
  //   return () => {
  //     player.destroy();
  //   };
  // }, [currentPlaying, videoPlayerRef]);
  //create player ref only once to avoid race conditions
  useEffect(() => {
  if (!videoPlayerRef.current || playerRef.current) return; // Don't re-init if exists

  playerRef.current = YouTubePlayer(videoPlayerRef.current, {
    playerVars: {
      autoplay: 1,
      controls: 1,
    },
  });

  const listener = playerRef.current.on('stateChange', (event: any) => {
    // YouTube's 'Ended' state is 0
    
    if (event.data === 0) {
      console.log("inside listener");
      if (tracksRef.current && tracksRef.current.length > 0) {
        handlePlayNext(); 
      } else {
        console.log("Ref queue was empty.");
      }
    }
  });

  return () => {
    // Clean up the listener and destroy player on unmount
    playerRef.current?.destroy();
  };
}, []);

  {/*for autoplaying the next video in the queue. load video when current playing changes*/}
  useEffect(() => {
    if(!playerRef.current) return;

    // 'loadVideoById' is queued until the player is ready to receive API calls.
    playerRef.current.loadVideoById(currentPlaying?.extractedId || DEFAULT_PLAYING_EXTRACTED_ID);

    // 'playVideo' is queue until the player is ready to received API calls and after 'loadVideoById' has been called.
    playerRef.current.playVideo();

  },[currentPlaying]);


  async function refreshStreams() {
    try {
      const res = await fetch(`/api/streams?spaceId=${spaceId}`, {
        method: "GET"
      });
      if (!res.ok) {
        console.error("Error from fetch(api/streams) refreshing streams:", res.status, await res.text());
        return;
      }

      const {streams: streamsThisUser} = await res.json();
      if (streamsThisUser) streamsThisUser.sort(customSortQueueComparator);
      setTracks(streamsThisUser);
      
    } catch (error) {
      console.error("Failed to refresh streams:", error);
    }
  }

  const customSortQueueComparator = (a: Video,b: Video) => {
    const aUpvotes = a.upvoteCount;
    const bUpvotes = b.upvoteCount;
    if (aUpvotes > bUpvotes) {
      return -1;
    }

    if (aUpvotes < bUpvotes) {
      return 1;
    }
    
    if (a.createdAt < b.createdAt) {
      return -1;
    }

    if (a.createdAt > b.createdAt) {
      return 1;
    }
    return 0;
  } 


  // Handle upvote
  const handleUpvote = async (id: string) => {
    if (!socket) return;
    if (!tracks || tracks.length === 0) {
      return;
    }
    const likedTrackIndex = tracks.findIndex((track) => track.id === id);
    const currentCount = tracks[likedTrackIndex].upvoteCount;
    const isAlreadyLiked = tracks[likedTrackIndex].hasUpvoted;
    // console.log("inside handleupvote, upvote received for ", id," with index ",likedTrackIndex);
    // console.log("isalreadyliked for current upvoted ", isAlreadyLiked);
    socket.emit("upvoteChange", {id, count: currentCount + 1, upvoted: !isAlreadyLiked});
    console.log("working till here in handleupvote");
    const res = await fetch("/api/streams/upvote", {
      method: "POST",
      body: JSON.stringify({streamId: id})
    });
  }

  // Handle downvote
  const handleDownvote = async (id: string) => {
    if (!socket) return;
    if (!tracks || tracks.length === 0) {
      return;
    }
    const dislikedTrackIndex = tracks.findIndex((track) => track.id === id);
    const currentCount = tracks[dislikedTrackIndex].upvoteCount;
    // const isAlreadyLiked = tracks[likedTrackIndex].hasUpvoted;
    // console.log("inside handleupvote, upvote received for ", id," with index ",likedTrackIndex);
    // console.log("isalreadyliked for current upvoted ", isAlreadyLiked);
    socket.emit("upvoteChange", {id, count: currentCount - 1});
    console.log("working till here in handleupvote");
    const res = await fetch("/api/streams/downvote", {
      method: "POST",
      body: JSON.stringify({streamId: id})
    });
  }

  
  const handlePlayNext = async () => {
    if (!socket || !tracks || tracks.length === 0) return;
    const [nextVideo, ...restQueue] = tracks;
    
    socket.emit("updateQueueOnShift", restQueue);
    socket.emit("changeCurrentPlaying", nextVideo);
    
    setTracks(restQueue);
    setCurrentPlaying(nextVideo);

    // await removeTrack(nextVideo.id); 
  };

  const addNewTrack = async (e : FormEvent) => {
    if (!socket) return;
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

    const extractedId = getYoutubeVideoId(newSongURL);
    if (uniqueVideoIds.has(extractedId)) {
      setAddSongMessage("Track already exists in this space.");
      setAddUrl("");
      setLoading(false);
      setTimeout(() => setAddSongMessage(null), 2000);
      console.log("caught in client side");
      return;
    }
    
    const res = await fetch("/api/streams", {
      method: "POST",
      body: JSON.stringify({url: newSongURL, spaceId: spaceId})
    });
  
    const newStream = await res.json();
    const updated = tracks ? [...tracks, newStream] : [newStream];
    const sorted = sortQueue(updated);
    setTracks(sorted);
    socket.emit("updateQueue", sorted);

    setAddSongMessage("Track added!");
    setAddUrl("");
    setLoading(false);
    setTimeout(() => setAddSongMessage(null) ,1000); 
  }

  const handleShare = async () => {
    const urlCopiedToClipboard = `${window.location.hostname}/space/${spaceId}`;
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

  const removeTrack = async (id: string) => {
    if (!socket || !tracks) return;
    const res = await fetch(`/api/streams/remove?id=${id}`, {
      method: "DELETE"
    });
    if (res.ok) {
      const copy = tracks?.filter((track) => track.id !== id);
      socket.emit("updateQueue", copy);
    }
  }

  const emptyQueue = async () => {
    if (!socket) return;
    if (!tracks) return;
    const res = await fetch("/api/space/truncate", {
      method: "DELETE",
      body: JSON.stringify({
        spaceId: spaceId
      })
    });
    if(res.ok) {
      socket.emit("updateQueue", []);
    }
  }

  const handleDeleteSpace = async () => {
    const res = await fetch(`/api/space/drop?id=${spaceId}`, {
      method: "DELETE"
    });

    if(!res.ok){
      console.log("an error occured while deleting space");
      return;
    }
    router.push("/creator/dashboard");
  }


  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Main content area */}
      <div className=" grid grid-cols-12 h-screen overflow-hidden">
        {/* Main content */}
        <div className=" col-span-8 flex-1 overflow-y-auto p-6 pr-4 bg-zinc-950">
          {/* Header */}
          <div className="flex items-center mb-6">
            <div className="flex flex-row justify-between items-center w-full">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-yellow-300 rounded-full"></div>
                <h1 className="text-xl font-semibold">butter</h1>
              </div>
              {/* Share current space*/}
              <div className="flex items-center justify-end">
                <button className="hover:bg-zinc-800 p-1 rounded">
                  <House
                    onClick={() => router.push("/creator/dashboard")}
                    size={19}
                    />
                </button>
                <button className="hover:bg-zinc-800 p-1 rounded">
                  <Share2 
                    onClick={() => handleShare()}
                    size={19}
                    />
                </button>
              </div>

            </div>
          </div>

          {/* Search bar and Add to playlist button */}
          <form className="flex gap-4 mb-4" onSubmit={addNewTrack} >
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
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-md text-sm cursor-pointer"   
              type="submit"
            >
              <PlusCircle className="h-4 w-4" />
              {loading? "Adding..." : "Add to playlist"}
            </button>
          </form>

          {/* youtube embed for preview*/}
          {
            addUrl && isValidYoutubeURL(addUrl) && !loading &&
            <div>
              <div className="mt-3"><h4>Preview</h4></div>
              <div className="w-100 aspect-video bg-zinc-800 rounded-md overflow-hidden">
                <div className="bg-zinc-800 rounded-md overflow-hidden">
                  <div
                    ref={videoPlayerRef}
                    className="w-full h-60"
                  />
                </div>
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
          <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-2">
            <div className="flex gap-4 text-sm text-zinc-400 overflow-x-auto">
              <button className="px-2 py-1">Moods</button>
              <button className="px-2 py-1">Qualities</button>
              <button className="px-2 py-1">Genre</button>
              <button className="px-2 py-1">Instruments</button>
              <button className="px-2 py-1">Vocals</button>
              <button className="px-2 py-1">Tempo</button>
              <button className="px-2 py-1">Shape</button>
              <button className="px-2 py-1">Brief</button>
            </div>

            {/* Trash button */}
            {/* <div className="text-sm text-zinc-400 mr-2">
              <button className="hover:text-red-500 transition" onClick={() => emptyQueue()}>
                <Trash size={19} />
              </button>
            </div> */}
            {
              <AlertDialogPopUp 
                title="Are you sure you want to delete all tracks?"
                description="This action will delete all tracks in this space but the space will not be deleted. This action is not recoverable."
                action="Delete"  
                trigger={
                  <Trash 
                    size={19} 
                    className="hover:text-red-500 hover:scale-110 transition-all cursor-pointer"
                  />
                }
                onClick={emptyQueue}
              />
            }
        </div>

          

          {/* Table header */}
          <div className="grid grid-cols-12 text-xs text-zinc-500 uppercase mb-2 pl-2">
            <div className="col-span-7">TITLES ({tracks ? `${tracks?.length}+` : ""})</div>
            <div className="col-span-2 text-center">UPVOTES</div>
            <div className="col-span-1 text-center">DURATION</div>
            <div className={`col-span-1 text-center`}>PLATFORM</div>
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
                className="grid grid-cols-12 gap-2 items-center py-2 rounded-md hover:bg-zinc-900/50"
                onMouseEnter={() => setHoveringOnTrack(track.id)}
                onMouseLeave={() => setHoveringOnTrack(null)}
              >
                <div className="col-span-7 flex items-center gap-3">
                  <div className="relative aspect-5/3 w-12 rounded overflow-hidden bg-zinc-800">
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
                <div className="col-span-1 text-sm text-zinc-400 text-center">{"1:20"}</div>
                <div className={`col-span-1 text-sm text-zinc-400 flex justify-center`}>{<Music />}</div>
                { hoveringOnTrack && hoveringOnTrack === track.id && 
                
                  <AlertDialogPopUp 
                    title="Are you sure you want to delete this track?"
                    description="This action is not recoverable."
                    action="Delete"  
                    trigger={ 
                      <span 
                        className="flex items-center justify-center p-1 text-zinc-400 hover:text-red-500 hover:scale-110 transition-all cursor-pointer"> 
                        <CircleX size={19}/>
                      </span>
                    }
                    onClick={() => removeTrack(track.id)}
                
                    id={track.id}
                  />
                }
              </div>
            ))}
          </div>
        }
        </div>
        
        {/* Right sidebar */}
        <div className="col-span-4 bg-zinc-900 p-4 pt-6 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-end gap-2">
            <AlertDialogPopUp 
                  title="Are you sure you want to delete this space?"
                  description="All tracks along with this space will be deleted. This action is not recoverable."
                  action="Delete Space"  
                  trigger={ 
                    <Button className="hover:scale-100 transition-all cursor-pointer">Drop Space</Button>
                  }
                  onClick={handleDeleteSpace}
                />
            <button 
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-md text-sm cursor-pointer"   
            >
              <LogOut
                onClick={async () => {
                  await signOut({callbackUrl: "/"});
                }}
                size={21}
                />
            </button>
            </div>
          <div/>        

            {/* YouTube embed with Now Playing text */}
          <div className="mt-6">
            <h3 
              className="my-2 font-sans text-yellow-300 text-xl font-semibold inline-block bg-clip-text"
              >now playing</h3>
            <h2 className="my-4">{currentPlaying?.title || "Never Gonna Give You Up"}</h2>
            <div className=" bg-zinc-800 rounded-md overflow-hidden">
              <div className="w-full h-60" ref={videoPlayerRef}></div>
              {/*
              <LiteYouTubeEmbed 
                id= {getYoutubeVideoId(currentPlaying?.url ?? DEFAULT_PLAYING_URL)}
                title="Random title"
              />
              <div> */}
            </div>
          </div>
          

          <div className="flex flex-row justify-center active:scale-95 hover:scale-95 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-md text-sm">
            <button 
              className="text-center flex flex-row justify-center gap-2  active:scale-95 transition-all duration-300 ease-in-out"
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

