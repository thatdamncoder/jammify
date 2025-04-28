import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prismaClient } from "./db";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
          })
    ],
    callbacks: {
        async signIn(params){
            if (!params.user.email){
                return false;
            }
            try{
                await prismaClient.user.create({
                    data:{
                        email: params.user.email,
                        provider: "Google"
                    }   
                });
            } catch(error){
            }
            return true;
        }
    },
    // pages: {
    //     signIn: "/login",
    //     error: "/login"
    // },
    // session:{
    //     strategy: "jwt",
    //     maxAge: 10 * 24 * 60 * 60
    // }
}
