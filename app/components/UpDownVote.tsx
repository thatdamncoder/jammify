import { ChevronDown, ChevronUp } from "lucide-react";

interface VoteInterface {
    upvotes: number;
    id: string;
    hasUpvoted: boolean;
    handler: (id: string) => void
}

const UpDownVote = ({upvotes, id, hasUpvoted, handler} : VoteInterface) => {
    return (
        <div className="col-span-2 text-center">
            <button
            onClick={() => handler(id)}
            className={`flex items-center justify-center gap-1 mx-auto p-1 rounded ${
                !hasUpvoted ? "hover:bg-zinc-800" : "bg-zinc-800"
            }`}
            >
            { !hasUpvoted
              ? <ChevronUp className="h-4 w-4 text-zinc-400" />
              : <ChevronDown className="h-4 w-4 text-zinc-400" /> } 
            <span className="text-sm text-zinc-400">{upvotes}</span>
            </button>
        </div>
    );
}

export default UpDownVote;