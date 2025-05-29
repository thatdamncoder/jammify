"use client";
import MusicApp from "@/app/components/v0dev";
import { useSession } from "next-auth/react";
import { NextResponse } from "next/server";

export default function Dashboard(){
    const session = useSession();

    if (!session.data?.user._id) {
        // return NextResponse.json(
        //     {message : "Unauthenticated"},
        //     {status: 403}
        // );
        return <div> Unauthenticated user </div>
    }
    const creatorId = session.data.user._id;
    return (
        <div>
            
        </div>
    );
}
/*
butter.com
login
butter.com/creator/dashboard

butter.com/space/[spaceId]
*/