import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import React from "react";

interface AlertDialogParams{
    title: string;
    description: string;
    action: string;
    trigger: React.ReactNode;
    onClick: (id? : string) => {}
    id?: string; 
}
export default function AlertDialogPopUp(
    { title, description, action, trigger, onClick, id} 
    : AlertDialogParams){
    return (
        <AlertDialog>
            <AlertDialogTrigger>{trigger}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel className="text-white">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onClick(id)}>{action}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}