# 🎵 Real-Time Collaborative Music Queue

A real-time collaborative music queue where multiple users can add YouTube videos to a shared playlist, upvote tracks, and listen together.

Each space acts as an isolated room — actions in one space never affect another.

---

## ✨ Features

* ➕ **Add songs** to a shared playlist using YouTube links
* 👍 **Upvote tracks** to reorder the queue dynamically
* ▶️ **Auto-play next track** when the current one ends
* 🧑‍🤝‍🧑 **Multi-user support** with isolated spaces (rooms)
* 🔄 **Real-time sync across users (play, pause, seek)** *(under progress)*

---

## 🧠 How it works (high level)

* Built with **Next.js**
* **Socket.IO** powers real-time communication
* Each space has:

  * Its own playback state
  * Its own queue
  * Its own connected users
* The server maintains the authoritative playback state per space and syncs it to all users.

---

## 🎥 Demo Video

📽️ **Sample Demo:**

> The demo shows:
>
> * Adding videos to the playlist
> * Upvoting tracks to reorder the queue
> * Automatic playback of the next song when the current one ends

🔗 *Demo video link:*

```
https://drive.google.com/file/d/1_cbDY2-AUzXwV-ehdfPcoAqJAtGR9KTO/view?usp=sharing
```

---

## 🚧 Status

This project is actively being developed.

Planned improvements:

* Finalizing reliable real-time playback sync
* Better late-join user synchronization
* Host / moderator controls
* UI & UX refinements
