import type { PlaybackState } from "@/lib/types";
import { createServer } from "http";
import {Server} from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
   cors: {
    origin: "*"
   } 
});
let playbackState: PlaybackState | null = null;

io.on("connection", (socket) => {
   console.log("socket connection to server established");
   console.log("User connected", socket.id);

   //current playing controls
   socket.on("joinSpace", () => {
      if (playbackState) {
         console.log("playback state", playbackState);
         socket.emit("syncPlayback", playbackState);
      }
   });

   socket.on("play", ({ videoId, currentTime }) => {
      playbackState = {
         videoId,
         isPlaying: true,
         startedAt: Date.now() - currentTime * 1000,
      };
      console.log("playback state", playbackState);

      io.emit("syncPlayback", playbackState);
   });

   socket.on("pause", ({ currentTime }) => {
      if (!playbackState) return;
      console.log("paused");
      console.log(playbackState);
      playbackState = {
         ...playbackState,
         isPlaying: false,
         pausedAt: currentTime,
      };

      socket.broadcast.emit("syncPlayback", playbackState);
   });

   socket.on("seek", ({ time }) => {
      if (!playbackState) return;

      playbackState = {
         ...playbackState,
         startedAt: Date.now() - time * 1000,
      };

      io.emit("syncPlayback", playbackState);
  });

   //queue controls
   socket.on("upvoteChange", (data) => {
      console.log("upvote changed");
      io.emit("upvoteChanged", data);
   });

   socket.on("changeCurrentPlaying", (video) => {
      io.emit("changedCurrentPlayingVideo", video);
   });

   socket.on("updateQueue", (queue) => {
      io.emit("updatedQueue", queue);
   });

   socket.on("updateQueueOnShift", (queue) => {
      io.emit("updatedQueueOnShift", queue);
   });  


   //disconnect control
   socket.on("disconnect", (reason) => {
      console.log("disconnected from server reason- ", reason);
   });
});


httpServer.listen(4000, () => {
   console.log("web socket server running on port 4000");
});

