import { auth } from "@/lib/auth";
import { prismaClient } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
    const session = await auth();

    if (!session?.user._id) {
        return NextResponse.json(
            {message: "Unauthenticated"},
            {status: 403}
        );
    }

    const userId = session.user._id;
    
    const { searchParams } = new URL(req.url);
    const streamId = searchParams.get("id");

    if (!streamId) {
        return NextResponse.json(
            {message: "streamId required"},
            {status: 400}
        );
    }

    try {
        const space = await prismaClient.stream.findFirst({
            where: {
                id: streamId
            },
            select: {
                spaceId: true,
                userId: true,
            },
        }); 
        const spaceId = space?.spaceId;
        const creatorIdThisStream = space?.userId;

        if (userId !== creatorIdThisStream) {
            return NextResponse.json(
                {message: "Forbidden"},
                {status: 400}
            );
        }

        const [resRemoveUpvotesForThisStream, resRemoveStream] = await prismaClient.$transaction([
            prismaClient.upvote.deleteMany({
                where: {
                    streamId: streamId
                }
            }),
            prismaClient.stream.delete({
                where: {
                    spaceId: spaceId,
                    id: streamId
                }
            })
        ]);

        console.log("deleted track response", resRemoveStream);
        return NextResponse.json(
            {message: "Track removed successfully"},
            {status: 200}
        );

    } catch (err){
        console.log(err);
        return NextResponse.json(
            {message: "An error occurred while removing track"},
            {status: 403}
        );
    }
}