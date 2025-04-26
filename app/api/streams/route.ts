import { prismaClient } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod";

const YOUTUBE_REGEX = new RegExp("https:\/\/(www\.)?youtube\.com\/watch\?v=[A-Za-z0-9_-]{11}")

const CreateStreamSchema = z.object({
    creatorId: z.string(),
    url: z.string() 
});

export const POST = async ({req}: {req: NextRequest}) => {
    try {
        const data = await CreateStreamSchema.parse(req.json());
        const {creatorId, url} = data;

        const isYoutubeUrl = YOUTUBE_REGEX.test(url);
        if(!isYoutubeUrl){
            throw NextResponse.json(
                {error: "Wrong URL format"},
                {status: 411}
            );
        }

        const extractedId = url.split("?v=")[1];

        prismaClient.stream.create({
            data: {
                userId: creatorId,
                url: url,
                type: "Youtube",
                extractedId: extractedId
            }
        });
        
    } catch (err){
        throw NextResponse.json(
            {error: "An error occured while creating the stream"},
            {status: 411}
        );
    }
}