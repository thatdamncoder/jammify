import Image from "next/image";
import { AppBar } from "./components/AppBar";
import { Dashboard } from "./components/Dashboard";
import { SearchBar } from "./components/SearchBar";
import MusicApp from "./components/v0dev";

export default function Home() {
  return (
    // <div className="w-full h-full text-white backdrop-blur-3xl shadow-md">
    //   <AppBar />
    //   <div className="mx-30">
    //     <SearchBar />
    //     <Dashboard />
    //   </div>
      
    // </div>
    <div><MusicApp /></div>
  );
}
