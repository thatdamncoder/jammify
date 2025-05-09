import { prismaClient } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest){
    const session = await getServerSession();

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
        }
    }); 

    return NextResponse.json({streamsThisUser});
}