import { authOptions } from "@/lib/auth";
import { prismaClient } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest){
    const session = await getServerSession(authOptions);
    
    if (!session?.user._id){
        return NextResponse.json(
            {message: "Unauthorized"},
            {status: 403}
        );
    }

    const userId = session.user._id;
    const {spaceId} = await req.json();
    try {
        const thisSpace = await prismaClient.space.findFirst({
            where: {
                id: spaceId
            }
        });

        if(userId !== thisSpace?.creatorId) {
            console.log("here", userId, thisSpace?.creatorId);
            return NextResponse.json(
                {message: "Forbidden"},
                {status: 403}
            );
        }

        const [resRemoveUpvotesForThisSpace,resRemoveStreamsInThisSpace] = await prismaClient.$transaction([
            prismaClient.upvote.deleteMany({
                where:{
                    stream: {
                        spaceId: spaceId
                    }
                }
            }),
            prismaClient.stream.deleteMany({
                where: {
                    spaceId: spaceId
                }
            })
        ]);

        return NextResponse.json(
            {message: "Contents of space deleted successfully"},
            {status: 200}
        );

    } catch (err){
        console.log(err);
        return NextResponse.json(
            {message: "Error occured while deleting contents of space"},
            {status: 411}
        );
    }
} 