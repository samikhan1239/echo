 "use client "

 import { useAtomValue, useSetAtom } from "jotai";
 import { AlertTriangleIcon, LoaderIcon } from "lucide-react";
 import { contactSessionIdAtomFamily, errorMessageAtom, loadingMessageAtom, organizationIdAtom, screenAtom, widgetSettingsAtom } from "../../atoms/widget-atoms";
 import { WidgetHeader } from "../components/widget-header";
import { useEffect, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";



 type InitStep = "org" | "session" | "settings" | "vapi" | "done";

 export const WidgetLoadingScreen =({organizationId}: {organizationId: string | null}) =>{
  const [step, setStep] =  useState<InitStep>("org")

  const[sessionValid, setSessionValid] = useState(false);
  const setWidgetSettings = useSetAtom(widgetSettingsAtom)

  const loadingMessage = useAtomValue(loadingMessageAtom);
  const setOrganizationId = useSetAtom(organizationIdAtom);
    const setErrorMessage = useSetAtom(errorMessageAtom);
    const setScreen = useSetAtom(screenAtom);
    const setLoadingMessage= useSetAtom(loadingMessageAtom);

 const contactSessionId = useAtomValue(contactSessionIdAtomFamily(organizationId || ""));


    const validateOrganization = useAction(api.public.organizations.validate)


useEffect(() =>{
  if(step !== "org"){
    return;
  }


  setLoadingMessage("Finding organization ID...");

  if(!organizationId){
    setErrorMessage("Organization ID is required");
   setScreen("error");
   return;


  }

  setLoadingMessage("Verfying organization...");

  validateOrganization({organizationId}).then((result) =>{
    if(result.valid){
      setOrganizationId(organizationId);
      setStep("session")

    }else{
      setErrorMessage(result.reason || "Invalid configuration");
      setScreen("error");

    }
  }).catch(() =>{
    setErrorMessage("Unable to verify organization");
    setScreen("error");

  })

}, [step, 
  organizationId, 
  setErrorMessage, 
  setScreen,
setOrganizationId,
setStep,
validateOrganization,
setLoadingMessage

]);

// Step 2: Validate session (if exists)

const validateContactSession = useMutation(api.public.contactSessions.validate);   

useEffect(() => {
  if(step !== "session"){
    return;
  }

setLoadingMessage("Finding contact session ID...");

  if(!contactSessionId){
    setSessionValid(false);
    setStep("settings");
    return;
  }
  setLoadingMessage("Validating session...");

  validateContactSession({
    contactSessionId
  }).then((result) => {
    setSessionValid(result.valid);
    setStep("settings");

  })
  .catch(() =>{
    setSessionValid(false);
    setStep("settings");
  })
} ,[step, contactSessionId, validateContactSession, setLoadingMessage]);

// Step 3: Laod Widget Settings
const widgetSettings = useQuery(api.public.widgetSettings.getByOrganizationId,
  
  
  organizationId ?{

organizationId,


} : "skip",


);

useEffect(() =>{

  if(step !== "settings"){
    return;
  }

setLoadingMessage("Loading widget settings...");

if(widgetSettings !== undefined){

       setWidgetSettings(widgetSettings);
       setStep("done");

}




} ,[

  step,
  widgetSettings,
  setStep,
  setWidgetSettings,
  setLoadingMessage
]);






useEffect(() => {
  if(step !== "done"){
    return;
  }
  const hasValidSession = contactSessionId && sessionValid;
  setScreen(hasValidSession ? "selection" : "auth");

},[step, contactSessionId, sessionValid, setScreen]);

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
  <div className ="flex flex-1 flex-col items-center justify-center gap-y-4 p-4 text-muted-foreground">
    <LoaderIcon className="animate-spin"/>
    <p className="text-sm">
    {loadingMessage || "Loading..."}
    </p>

  </div>

        </>
    )

 }