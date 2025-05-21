import { $Enums } from "./generated/prisma";

interface Video{
    url: string;
    type: $Enums.StreamType;
    id: string;
    extractedId: string;
    title: string;
    smallImg: string;
    bigImg: string;
    active: boolean;
    userId: string;
    upvoteCount: number;
    hasUpvoted: boolean;
}

interface Form{
    url: string;
}