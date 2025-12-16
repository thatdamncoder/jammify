import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prismaClient } from "./db";

export const  { handlers, auth, signIn, signOut} = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
          })
    ],
    secret: process.env.NEXTAUTH_SECRET!,
    callbacks: {
        async signIn(params){ //runs on every login 
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
        async jwt({user, token}) { //runs on every login and every request
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
        async session({session, token}){ //runs when frontend calls useSession()
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
});
