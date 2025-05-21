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
    secret: process.env.NEXTAUTH_SECRET!,
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
        },
        async jwt({user, token}) {
            if (user?.email) {
                const dbUser = await prismaClient.user.findUnique({
                    where: {
                        email: user.email
                    }
                });

                if (dbUser) {
                    token._id = dbUser.id;
                }
            }
            return token;
        },
        async session({session, token}){
            if(session.user && token._id){
                session.user._id = token._id as string;
            }
            return session;
        }
    },
    // pages: {
    //     signIn: "/login",
    //     error: "/login"
    // },
    session:{
        strategy: "jwt"
    }
}
