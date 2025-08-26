 "use client "

 import { useAtomValue, useSetAtom } from "jotai";
 import { AlertTriangleIcon, ChevronRightIcon, MessageSquareIcon } from "lucide-react";
 import { contactSessionIdAtomFamily, conversationIdAtom, errorMessageAtom, organizationIdAtom, screenAtom } from "../../atoms/widget-atoms";
 import { WidgetHeader } from "../components/widget-header";
import { Button } from "@workspace/ui/components/button";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useState } from "react";
import { WidgetFooter } from "../components/widget-footer";

 export const WidgetSelectionScreen =() =>{
const setScreen = useSetAtom(screenAtom);
const setErrorMessage = useSetAtom(errorMessageAtom);
const setConversationId = useSetAtom(conversationIdAtom);
const organizationId = useAtomValue(organizationIdAtom);
const contactSessionId = useAtomValue(
  contactSessionIdAtomFamily(organizationId || " " )
);
const createConversation = useMutation(api.public.conversations.create);
const [isPending, setIsPending] = useState(false);


const handleNewConversation = async () => {
  
    if(!organizationId){
     
    setScreen("error");
    setErrorMessage("Missing Organization ID");
    return;
  }


  if(!contactSessionId){
    setScreen("auth");
    return;
  }
   setIsPending(true);

  try{
    const conversationId = await createConversation({
      contactSessionId,
      organizationId,
    });


    setConversationId(conversationId);
    setScreen("chat")

  }
  catch{
    setScreen("auth")

  } finally{

    setIsPending(false);
  }


};

    const errorMessage = useAtomValue(errorMessageAtom);

    return (
        <>
<WidgetHeader>
  <div className ="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
    <p className =" text-3xl">
      Hi there! 👋
    </p>
    <p className=" text-lg">
    Let&apos;s get you started
    </p>

  </div>
  </WidgetHeader>
  <div className ="flex flex-1 flex-col gap-y-4 p-4 overflow-y-auto">
    <Button
    className="h-16 w-full justify-between"
    variant="outline"
    onClick={handleNewConversation}
    disabled={isPending}
    >
      <div className ="flex items-center gap-x-2">
        <MessageSquareIcon className ="size-4"/>
        <span> Start chat</span>
      </div>
      <ChevronRightIcon/>

    </Button>
  

  </div>

  <WidgetFooter/>

        </>
    )

 }