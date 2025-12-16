import { auth } from "@/lib/auth";
import { prismaClient } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createSpaceSchema = z.object({
    title: z.string(),
    private: z.boolean()
});

export async function POST(req: NextRequest){
    const session = await auth();

    if(!session?.user._id){
        return NextResponse.json(
            {message: "Unauthenticated"},
            {status: 403}
        );
    }

    const creatorId = session.user._id;

    try {
        const reqData = createSpaceSchema.parse(await req.json());

        const rescreateSpace = await prismaClient.space.create({
            data:{
                creatorId: creatorId,     
                title: reqData.title,
                private: reqData.private,
                createdAt: new Date(),
            }
        });

        return NextResponse.json({
            space: rescreateSpace
        });


    } catch (err){
        console.log(err);
        return NextResponse.json(
            {message: "An error occurred while creating space"},
            {status: 400}
        );
    }

}