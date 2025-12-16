"use client"

import type React from "react"
import { use, useEffect, useState } from "react"
import Link from "next/link"
import { Home, Music, Plus, Users, Calendar, Crown, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar"
import SpaceCard from "@/app/components/SpaceCard"
import { prismaClient } from "@/lib/db"
import { useSession, signOut } from "next-auth/react"
import { Space } from "@/lib/types"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import Image from "next/image"

 //TODO: colorful cards, only avatar and name, when hover, show details, animation reveal from down to up


export default function SpacesPage() {
  const session = useSession();
  const [spaces, setSpaces] = useState<Space[] | null>(null); 
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState("");
  const [newSpaceDescription, setNewSpaceDescription] = useState("");
  const [newSpacePrivate, setNewSpacePrivate] = useState(true);
  const router = useRouter();
  const profileImageURL = session?.data?.user?.image;

  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpaceName.trim()) return;
   
    const res = await fetch("/api/space/create", {
        method: "POST",
        body: JSON.stringify({title: newSpaceName, private: newSpacePrivate})
    });

    if (!res.ok) {
        console.log("an error occurred while creating stream");
        return;
    }

    setNewSpaceName("");
    setNewSpaceDescription("");
    setIsCreateDialogOpen(false);

    

    const {space} = await res.json();
    console.log(space.id);
    router.push(`/space/${space.id}`);
    
  }
  
  const getSpacesForThisUser= async () => {
    const res = await fetch("/api/space/get", {
        method: "GET"
    });
    const data = await res.json();
    console.log(data);
    setSpaces(data.spaces);
  }  

  useEffect(() => {
    getSpacesForThisUser();
  }, []);

  if (!session.data?.user._id) {
    return <div>Unauthenticated</div>
  } 
  const userId = session.data.user._id;

  
  return (
    <SidebarProvider className="flex h-screen bg-background text-foreground">
        <Sidebar className="bg-sidebar text-sidebar-foreground">
        <SidebarHeader className="flex h-14 items-center border-b border-border px-4">
            <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-yellow-300" />
            <span className="text-lg font-bold">muzi</span>
            </div>
        </SidebarHeader>

        <SidebarContent>
            <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild>
                <Link href="/dashboard">
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive>
                <Link href="/spaces">
                    <Users className="h-4 w-4" />
                    <span>Spaces</span>
                </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            </SidebarMenu>

            <div className="px-4 py-2">
            <h3 className="mb-2 text-sm font-medium">Quick Stats</h3>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                </div>
            </div>
            </div>
        </SidebarContent>

        <SidebarFooter className="border-t border-border p-4">
        `<div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
                {profileImageURL ? (
                    <Image
                    src={profileImageURL}
                    width={30}
                    height={30}
                    alt="User profile image"
                    className="rounded-full"
                    />
                ) : (
                    <Avatar>
                    <AvatarFallback className="bg-linear-to-br from-indigo-400 to-purple-500 text-white">
                        ME
                    </AvatarFallback>
                    </Avatar>
                )}

                <div>
                    <p className="text-sm font-medium">
                    {session.data?.user?.name ?? "User"}
                    </p>
                    <p className="text-xs text-muted-foreground">Online</p>
                </div>
            </div>

            <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-red-400 hover:text-red-500"
            >
                Logout
            </Button>
        </div>
        </SidebarFooter>`

        </Sidebar>

        <main className="flex-1 overflow-auto p-6">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">your spaces</h1>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
                <DialogTrigger asChild>
                    <Button variant="default" className="bg-gradient-to-r from-orange-400 to-pink-500 text-white hover:opacity-90">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Space
                    </Button>
                </DialogTrigger>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle className="text-yellow-300">Create a New Space</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateSpace} className="space-y-4">
                <div>
                    <Label htmlFor="spaceName" className="text-white">Space Name</Label>
                    <Input
                    className="text-white"
                    id="spaceName"
                    value={newSpaceName}
                    onChange={(e) => setNewSpaceName(e.target.value)}
                    required
                    />
                </div>
                <div>
                    <Label htmlFor="spaceDescription" className="text-white">Description</Label>
                    <Textarea
                    className="text-white"
                    id="spaceDescription"
                    value={newSpaceDescription}
                    onChange={(e) => setNewSpaceDescription(e.target.value)}
                    />
                </div>
                <div className="flex justify-around items-center m-2">
                    <Button type="submit">Create</Button>
                    <div>
                        <Switch checked={newSpacePrivate} onChange={() => setNewSpacePrivate(!newSpacePrivate)}/>
                        <p>Private</p>
                    </div>
                </div>
                </form>
            </DialogContent>
            </Dialog>
        </div>

        {spaces  && spaces.length > 0
          ? <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
              {spaces.map((space) => (
              <SpaceCard key={space.id} space={space} isCreated />
              ))}
          </div>

          : <div className="text-center text-xs text-zinc-500">
                create a space to Butter...
            </div>
        }
        </main>
    </SidebarProvider>
    );

}
