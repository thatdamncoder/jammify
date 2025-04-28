import { prismaClient } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod";

const YOUTUBE_REGEX = "/^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/";

const CreateStreamSchema = z.object({
    creatorId: z.string(),
    url: z.string() 
});

const ViewAllSchema = z.object({
    creatorId: z.string() //creatorId here is userid who created the stream
})

export const POST = async (req: NextRequest) => {
    try {
        const data = await CreateStreamSchema.parse(await req.json());
        const {creatorId, url} = data;

        const isYoutubeURL = url.match(YOUTUBE_REGEX);
        if(!isYoutubeURL){
            return NextResponse.json(
                {message: "Wrong URL format"},
                {status: 500}
            );
        }

        const extractedId = url.split("?v=")[1];

        await prismaClient.stream.create({
            data: {
                userId: creatorId,
                url: url,
                type: "Youtube",
                extractedId: extractedId
            }
        });

        return NextResponse.json(
            {message: "stream created"},
            {status: 202}
        );
        
    } catch (err){
        console.log(err);
        return NextResponse.json(
            {message: "An error occured while creating the stream"},
            {status: 411}
        );
    }
}

export const GET = async (req: NextRequest) => {
    //code 1
    const creatorId = req.nextUrl.searchParams.get("creatorId");
    const streams = await prismaClient.stream.findMany({
        where:{
            userId: creatorId ?? ""
        }
    });
    return NextResponse.json(streams);

    //code2
    //use when it is needed that only authorized users see 
    //but here any one can see the streams by user123
    // const session = await getServerSession();

    // if(!session?.user._id){
    //     return NextResponse.json(
    //         {error: "Unauthenticated"},
    //         {status: 403}
    //     )
    // }

    // const userId = session.user._id;

    // try {
    //     const userStreams = await prismaClient.user.findMany({
    //         include:{
    //             upvote: true
    //         },
    //         where: {
    //             id: userId as string
    //         }
    //     });
    //     console.log(userStreams);

    // } catch(err){
    //     return NextResponse.json(
    //         {error: "Error while fetching streams"},
    //         {status: 202}
    //     )
    // }
}