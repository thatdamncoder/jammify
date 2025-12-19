import { createServer } from "http";
import {Server} from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
   cors: {
    origin: "*"
   } 
});

io.on("connection", (socket) => {
   console.log("socket connection to server established");
   socket.on("upvoteChange", (data) => {
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

   socket.on("disconnect", () => {
      console.log("disconnected from server");
   });
});

httpServer.listen(4000, () => {
   console.log("web socket server running on port 4000");
});

