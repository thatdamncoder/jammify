import { AppBar } from "./components/AppBar";
import { Redirect } from "./components/Redirect";

export default function Home() {
  return (
    <>
    <Redirect />
    <div className="flex flex-col h-screen dark bg-black items-center justify-center gap-5">
        <p className="text-9xl font-bold text-white">muzi</p>
        <AppBar />
    </div>
    </>
  );
}
