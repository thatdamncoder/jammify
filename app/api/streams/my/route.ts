import { authOptions } from "@/lib/auth";
import { prismaClient } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest){
    const session = await getServerSession(authOptions);
    // console.log("---session running-----", session);
    if(!session?.user._id){
        return NextResponse.json(
            {message: "Unauthenticated user"},
            {status: 403}
        );
    }

    const userId = session.user._id as string;

    const streamsThisUser = await prismaClient.stream.findMany({
        where: {
            userId: userId ?? ""
        },
        include: {
            _count: {
                select: {
                    upvote: true
                }
            },
            upvote: {
                where: {
                    userId: userId
                }
            }
        }
    }); 
    // console.log("------streams fetched for user--------" ,streamsThisUser);
    
    return NextResponse.json({
        streams: streamsThisUser.map(({_count, upvote, ...rest}) => ({ 
            ...rest,
            upvoteCount: _count.upvote,
            hasUpvoted: upvote.length > 0 
        }))
    });
}
