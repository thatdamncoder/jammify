"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export const AppBar = () => {
    const { data: session, status} = useSession();
    const isLoading = status === "loading";

    return (
        <div className="flex flex-col justify-center h-screen w-screen">
            <div className="flex flex-1 flex-row items-center justify-center">
                <div className="m-2 p-2 bg-violet-400">
                    <h1 className="text-white font-bold text-lg">Welcome to Muzi</h1>
                </div>
                <div >
                    {
                        isLoading && <p>Loading...</p>
                    }
                    {
                        !isLoading && !session?.user && 
                        <button 
                            className="m-2 p-2 px-4 rounded-full bg-gray-700 text-white text-bold font-medium"
                            onClick={() => signIn()}
                        >
                            Sign In 
                        </button>
                    }
                    {
                        !isLoading && session?.user && 
                        <button 
                            className="m-2 p-2 px-4 rounded-full bg-gray-700 text-white text-bold font-medium"
                            onClick={() => signOut()}
                        >
                            Sign Out
                        </button>
                    }
                    
                </div>
            </div>
        </div>
    );
}

