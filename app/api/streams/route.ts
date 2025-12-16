import { prismaClient } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod";
//@ts-ignore
import youtubesearchapi from "youtube-search-api";
import { YOUTUBE_REGEX, MISSING_THUMBNAIL_URL, isValidYoutubeURL, getYoutubeVideoId } from "@/lib/url";
import { auth } from "@/lib/auth";

const CreateStreamSchema = z.object({
    spaceId: z.string(),
    url: z.string() 
});

const ViewAllSchema = z.object({
    creatorId: z.string() //creatorId here is userid who created the stream
})

export const POST = async (req: NextRequest) => {
    const session = await auth();
    
    if(!session?.user._id){
        return NextResponse.json(
            {message: "Unauthenticated"},
            {status: 403}
        );
    }
    
    const creatorId = session.user._id; 
    try {
        const data = CreateStreamSchema.parse(await req.json());
        const {spaceId, url} = data;

        const isYoutubeURL = isValidYoutubeURL(url);
        if(!isYoutubeURL){
            return NextResponse.json(
                {message: "Wrong URL format"},
                {status: 500}
            );
        }

        const extractedId = getYoutubeVideoId(url);
        const {thumbnail: {thumbnails}, title} = await youtubesearchapi.GetVideoDetails(extractedId);
        thumbnails.sort((a: {width: number},b: {width: number}) => (a.width - b.width));        
        const stream = await prismaClient.stream.create({
            data: {
                userId: creatorId,
                spaceId: spaceId,
                url: url,
                type: "Youtube",
                extractedId: extractedId,
                title: title ?? "Can't find video title",
                smallImg: (thumbnails.length > 1 ? thumbnails[thumbnails.length - 2]?.url : thumbnails[thumbnails.length - 1]?.url) ?? MISSING_THUMBNAIL_URL,
                bigImg: (thumbnails.length > 0 && thumbnails[thumbnails.length - 1].url) ?? MISSING_THUMBNAIL_URL,
                createdAt: new Date()
            }
        });
        return NextResponse.json({
            ...stream,
            upvoteCount: 0,
            hasUpvoted: false
        });
        
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
    const spaceId = req.nextUrl.searchParams.get("spaceId");
    const session = await auth();
    
    if (!spaceId) {
        return NextResponse.json(
            {message: "No spaceId provided while fetching streams"},
            {status: 411}
        );
    }
    
    const userId = session?.user._id;


    const streamsThisUser = await prismaClient.stream.findMany({
        where: {
            spaceId: spaceId 
        },
        include: {
            _count: {
                select: {
                    upvote: true
                }
            },
            upvote: {
                where: {
                    // userId: creatorId as string
                    userId: (userId ?? "") as string
                }
            }
        }
    }); 
    // console.log("------streams fetched for user--------" ,streamsThisUser);
    
    return NextResponse.json({
        streams: streamsThisUser.map(({_count, upvote, ...rest}) => ({ 
            ...rest,
            upvoteCount: _count.upvote,
            hasUpvoted: userId && upvote.length > 0
        }))
    });

    //code2
    //use when it is needed that only authorized users see 
    //but here any one can see the streams by user123
    // const session = await auth();

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