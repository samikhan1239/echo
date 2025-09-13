"use client";

import {

    type LucideIcon,
    BookOpenIcon,
    BotIcon,
    GemIcon,
    MicIcon,
    PaletteIcon,
    PhoneIcon,
    UsersIcon,
} from "lucide-react";
import {useRouter} from "next/navigation"; 
import { Button } from "@workspace/ui/components/button"

import {
Card,
CardDescription,
CardContent,
CardHeader,
CardTitle


} from "@workspace/ui/components/card";


interface Feature {

icon: LucideIcon;
label: string;
description: string;

};

interface PremiumFeatureOverlayProps {
    children: React.ReactNode;
};


const features: Feature[] =[];

export const PremiumFeatureOverlay = ({children}:PremiumFeatureOverlayProps) => {


return(

    <div className ="relative min-h-screen">
        {/* Blurred background content */ }
        <div className="pointer-events-none select-none blur-[2px]">

            {children}
        </div>
        {/* Overlay */ }
        <div className="absolute insert-0 bg-black/50 backdrop-blur-[2px]" />


        {/* Upgrade prompt */ }
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex items-center justify-center">
                        <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full border bg-muted">
                            <GemIcon className="size-6 text-muted-foreground"/>

                        </div>

                    </div>

                </CardHeader>

            </Card>

        </div>

    </div>
)


}