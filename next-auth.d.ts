import { DefaultSession } from "next-auth";

declare module "next-auth"{
    interface Session{
        user: {
            _id: String
        } & DefaultSession["user"]

    }
}