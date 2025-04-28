import { prismaClient } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod";

const DownvoteSchema = z.object({
    streamId: z.string()
})

export const POST = async (req: NextRequest) => {
    const session = await getServerSession();
    if(!session?.user._id){
        return NextResponse.json(
            {error: "Unauthenticated"},
            {status: 403}
        );
    }
    const userId = session.user._id;
    try {
        const data = DownvoteSchema.parse(await req.json());

        await prismaClient.upvote.delete({
            where:{
                userId_streamId: {
                    streamId: data.streamId,
                    userId: userId as string
                }  
            }
        });

    } catch (error){
        throw NextResponse.json(
            {error: "An error occured while downvoting stream"},
            {status: 403}
        );
    }
}
