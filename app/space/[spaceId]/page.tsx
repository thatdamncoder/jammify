import MusicApp from "@/app/components/v0dev"

export default function View ({
    params: {
        spaceId
    }
    }: {
        params: {
            spaceId: string
        }
    })
{
    
    return <div>   
        <MusicApp spaceId={spaceId}/>
    </div>
}