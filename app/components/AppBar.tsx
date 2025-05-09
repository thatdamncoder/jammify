"use client";
import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";

export const AppBar = () => {
    const { data: session, status} = useSession();
    const isLoading = status === "loading";

    return (
        <div>
            {
                isLoading && <p>Loading...</p>
            }
            {
                !isLoading && !session?.user && 
                <Button
                    onClick={() => signIn()}
                >
                    Sign In 
                </Button>
            }
            {
                !isLoading && session?.user && 
                <Button
                    onClick={() => signOut()}
                >
                    Sign Out
                </Button>
            }
        </div>
    );
}

