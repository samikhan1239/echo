import { Button } from "@workspace/ui/components/button";
import{

AIConversation,
AIConversationContent,
AIConversationScrollButton
} from "@workspace/ui/components/ai/conversation"

import{
  AIMessage,
  AIMessageContent
} from "@workspace/ui/components/ai/message";



import{useVapi} from "@/modules/widget/hooks/use-vapi";
import {WidgetHeader} from "@/modules/widget/ui/components/widget-header";
import { useSetAtom } from "jotai";
import { screenAtom } from "../../atoms/widget-atoms";
import { ArrowLeftIcon, MicIcon } from "lucide-react";
import { WidgetFooter } from "../components/widget-footer";
import { cn } from "@workspace/ui/lib/utils";



export const WidgetVoiceScreen =() => {

  const setScreen = useSetAtom(screenAtom);
  const {
isConnected,
isSpeaking,
transcript,
startCall,
endCall,
isConnecting
  } = useVapi();

  return (


<>
<WidgetHeader>
  <div className="flex items-center gap-x-2">
    <Button
    variant ="transparent"
    size="icon"
    onClick={() => setScreen("selection")}
    
    >
      <ArrowLeftIcon/>

    </Button>
    <p> Voice Chat</p>

  </div>
</WidgetHeader>

<div className="flex flex-1 h-full flex-col items-center justify-center gap-y-4">
<div className="flex items-center justify-center rounded-full border bg-white p-3">
  <MicIcon className ="size-6 text-muted-foreground"/>

</div>

<p className="text-muted-foreground">
  Transcript will appear here
</p>
</div>
<div className="border-t bg-background p-4">
  <div className="flex flex-col items-center gap-y-4">
    {isConnected && (
    <div className ="flex items-center gap-x-2">
      <div className ={cn("size-4 rounded-full",
        isSpeaking ? "animate-pulse bg-red-500" : "bg-green-500"
      )}/>
      <span className="text-muted-foreground text-sm">
        {isSpeaking ? "Assistant Speaking..." : "Listening..."}
      </span>

    </div>
    )}
    <div className="flex w-full justify-center">
      {isConnected ? (
        <Button>
End Call 
        </Button>

      ) : (
        <Button>
 Start Call
        </Button>
      )  }

    </div>

  </div>

</div>
<WidgetFooter/>


</>


  )

}

