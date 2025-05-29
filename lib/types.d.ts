import { $Enums } from "./generated/prisma";

interface Video {
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
    createdAt: Date;
}

interface Space {
    id: string;
    creatorId: string;   
    title: string; 
    private: boolean;
    createdAt: Date;
    isActive: boolean;
}

interface Form {
    url: string;
}