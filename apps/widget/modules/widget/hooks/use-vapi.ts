import Vapi from "@vapi-ai/web";
import { useEffect, useState } from "react";
interface TranscriptMessage{
    role: "user" | "assistant";
    text: string;
};
export const useVapi =() =>{
    const [vapi, setVapi] = useState <Vapi | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const[isConnecting, setIsConnecting] = useState(false);
    const [isSpeaking , setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);

    useEffect(() =>{
        const vapiInstance = new Vapi("4a8f5a36-5d37-499e-b7e9-ceaaf1f96f94");
        setVapi(vapiInstance);
vapiInstance.on("call-start", () =>{
    setIsConnected(true);
    setIsConnecting(false);
    setTranscript([]);

});

vapiInstance.on("call-end", ()=>{
    setIsConnected(false);
    setIsConnecting(false);
    setIsSpeaking(false);
});

vapiInstance.on("speech-start" , () =>{
    setIsSpeaking(true);
});

vapiInstance.on("speech-end" ,() =>{
    setIsSpeaking(false);
});

vapiInstance.on("error" , (error) =>{
    console.log(error,"VAPI_ERROR");
    setIsConnecting(false);
});

vapiInstance.on("message", (message) =>{
    if(message.type === "transcript" && message.transcriptType === "final"){
        setTranscript((prev) => [
            ...prev,
            {
                role:message.role === "user" ? "user" : "assistant" ,
                text: message.transcript,
            }
        ])
    }
})

return () => {
    vapiInstance?.stop();
}


    }, []);

    const startCall =() =>{
        setIsConnecting(true);

        if(vapi) {
            vapi.start("2afe9809-4acb-4571-9d65-d1779d054e65");
        }
    }

    const endCall = () =>{
        if(vapi) {
            vapi.stop();
        }
    };
    return {
        isSpeaking,
        isConnecting,
        isConnected,
        transcript,
        startCall,
        endCall


    }


}

