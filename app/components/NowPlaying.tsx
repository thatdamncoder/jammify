import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import Image from "next/image";
// @ts-ignore
import YouTubePlayer from "youtube-player";
import { Video } from "@/lib/types";

type Props = {
  currentVideo: string | null;
  playNext: () => void;
  playNextLoader?: boolean;
};

export default function NowPlaying({
  currentVideo,
  playNext,
  playNextLoader = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);

  /** Create player ONCE */
  useEffect(() => {
    if (!containerRef.current || playerRef.current) return;

    playerRef.current = YouTubePlayer(containerRef.current, {
      playerVars: {
        autoplay: 1,
        controls: 1,
      },
    });

    playerRef.current.on("stateChange", (event: any) => {
      if (event.data === 0) {
        playNext();
      }
    });

    return () => {
      playerRef.current?.destroy();
    };
  }, [playNext]);

  /** Load video when it changes */
  useEffect(() => {
    if (!playerRef.current || !currentVideo) return;

    playerRef.current.loadVideoById(currentVideo);
    playerRef.current.playVideo();
  }, [currentVideo]);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-yellow-300">Now Playing</h3>

      <Card>
        <CardContent className="p-4">
          {currentVideo ? (
            <>
              <div
                ref={containerRef}
                className="w-full h-60 rounded overflow-hidden bg-zinc-800"
              />
              <p className="mt-2 text-center font-semibold truncate">
                {currentVideo}
              </p>
            </>
          ) : (
            <p className="py-8 text-center text-zinc-400">
              No video playing
            </p>
          )}
        </CardContent>
      </Card>

      <Button
        disabled={playNextLoader || !currentVideo}
        onClick={playNext}
        className="w-full"
      >
        <Play className="mr-2 h-4 w-4" />
        {playNextLoader ? "Loading..." : "Play Next"}
      </Button>
    </div>
  );
}
