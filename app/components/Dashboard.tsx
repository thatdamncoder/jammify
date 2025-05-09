import { ThumbsDown, ThumbsUp } from "lucide-react";

export const Dashboard = () => {
    return (
        <div className="flex flex-row gap-10 text-white text-md font-light h-[40%]">
            <div className="flex-[3] basis-3/4 gap-3 rounded-lg text-left p-3 overflow-y-auto h-full">
                <table className="table-auto mt-4 text-left w-full border-spacing-x-1">
                    <thead>
                        <tr className="font-light">
                            <th className="pb-2 w-3/4">Title</th>
                            <th className="pb-2 w-1/6">Duration</th>
                            <th className="pb-2 w-1/12">Upvotes</th>
                            <th className="pb-2 w-1/12">Downvotes</th>
                        </tr>
                    </thead>
                    <tbody className="text-white font-medium">
                        {
                        [1,2,3,4,5,6,7,8,9,10].map((no,index) => (
                            <tr key={index} className="border-t border-amber-100 my-3 hover:bg-white/10">    
                                <td className="py-5 flex flex-row items-center">
                                    <div className="size-8 mr-3 rounded-sm bg-gradient-to-r from-pink-400 to-yellow-300">
                                        
                                    </div>
                                    <p>Song {index}</p>
                                </td>
                                <td className="py-2">2:30</td>
                                <td className="py-2 text-center">
                                <div className="flex flex-row items-center justify-center gap-2">
                                        <ThumbsUp size={18}/> 3
                                    </div>
                                    
                                </td>
                                <td className="py-2 text-center">
                                    <div className="flex flex-row items-center justify-center gap-2">
                                        <ThumbsDown size={18}/> 2
                                    </div>
                                </td>
                            </tr>
                        ))
                        }

                    </tbody>

                </table>
            </div>
            <div className="flex-[1] basis-1/4 bg-black rounded-lg text-center mt-8 p-4 h-[30%]">
                
                <h4 className="text-center m-3 p-4 text-white font-bold">
                    Now Playing
                </h4>
            </div>
        </div>
    );

}