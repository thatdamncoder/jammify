import { authOptions } from "@/lib/auth";
import { prismaClient } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod";

const UpvoteSchema = z.object({
    streamId: z.string()
})

export const POST = async (req: NextRequest) => {
    const session = await getServerSession(authOptions);
    if(!session?.user._id){
        return NextResponse.json(
            {error: "Unauthenticated"},
            {status: 403}
        );
    }
    const userId = session.user._id;
    try {
        const data = UpvoteSchema.parse(await req.json());

        const res = await prismaClient.upvote.create({
            data: {
                streamId: data.streamId,
                userId: userId as string
            }  
        });

        return NextResponse.json(
            {   
                message: "upvoted successfully" , 
                res: res
            },
            {status: 200}
        );

    } catch (error){
        throw NextResponse.json(
            {error: "An error occured while upvoting stream"},
            {status: 403}
        );
    }
}
