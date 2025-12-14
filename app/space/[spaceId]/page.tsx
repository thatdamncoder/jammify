import MusicApp from "@/app/components/v0dev"

export default async function View ({params} : {params: Promise<{spaceId: string}>}){  
    const {spaceId} = await params;
    return <div>  
        <MusicApp spaceId={spaceId}/>
    </div>
}