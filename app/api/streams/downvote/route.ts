import { auth } from "@/lib/auth";
import { prismaClient } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod";

const DownvoteSchema = z.object({
    streamId: z.string()
})

export const POST = async (req: NextRequest) => {
    const session = await auth();
    console.log("session in streams/downvote", session);
    if(!session?.user._id){
        return NextResponse.json(
            {statusText: "Unauthenticated"},
            {status: 403}
        );
    }
    const userId = session.user._id;
    try {
        const data = DownvoteSchema.parse(await req.json());

        const res = await prismaClient.upvote.delete({
            where:{
                userId_streamId: {
                    streamId: data.streamId,
                    userId: userId as string
                }  
            }
        });

        return NextResponse.json(
            {
                message: "stream downvoted successfully",
                res: res
            },
            { status: 200}
        );

    } catch (error){
        console.log(error);
        return NextResponse.json(
            {statusText: "An error occured while downvoting stream"},
            {status: 403}
        );
    }
}
