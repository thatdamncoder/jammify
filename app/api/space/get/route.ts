import { authOptions } from "@/lib/auth";
import { prismaClient } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest){
    const session = await getServerSession(authOptions);

    if(!session?.user._id){
        return NextResponse.json(
            {message:"Unauthenticated"},
            {status: 403}
        );
    }
    
    const userId = session.user._id;

    try{
        const resGetSpacesForCurrentUser = await prismaClient.space.findMany({
            where:{
                creatorId: userId
            }
        });
        
        return NextResponse.json({
            spaces: resGetSpacesForCurrentUser
        });


    } catch (err){
        console.log(err);
        return NextResponse.json(
            {message:"An error occured while fetching spaces for user"},
            {status: 400}
        );
    }

}