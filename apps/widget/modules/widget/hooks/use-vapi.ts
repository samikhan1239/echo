import Vapi from "@vapi-ai/web";
import { useEffect, useState } from "react";

interface TranscriptMessage {
  role: "user" | "assistant";
  text: string;
}

export const useVapi = () => {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);

  // Pull keys from env (make sure to define them in .env.local)
  const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY as string;
  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID as string;

  useEffect(() => {
    if (!publicKey) {
      console.error("Vapi public key is missing in env!");
      return;
    }

    const vapiInstance = new Vapi(publicKey);
    setVapi(vapiInstance);

    vapiInstance.on("call-start", () => {
      setIsConnected(true);
      setIsConnecting(false);
      setTranscript([]);
      console.log("Vapi call started");
    });

    vapiInstance.on("call-end", () => {
      setIsConnected(false);
      setIsConnecting(false);
      setIsSpeaking(false);
      console.log("Vapi call ended");
    });

    vapiInstance.on("speech-start", () => {
      setIsSpeaking(true);
    });

    vapiInstance.on("speech-end", () => {
      setIsSpeaking(false);
    });

    vapiInstance.on("error", (error) => {
      console.error("Vapi error:", error);
      setIsConnecting(false);
    });

    vapiInstance.on("message", (message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        setTranscript((prev) => [
          ...prev,
          {
            role: message.role === "user" ? "user" : "assistant",
            text: message.transcript,
          },
        ]);
      }
    });

    return () => {
      vapiInstance.stop();
      setVapi(null);
    };
  }, [publicKey]);

  const startCall = async () => {
    setIsConnecting(true);
    if (vapi) {
      try {
        if (!assistantId) {
          throw new Error("Vapi assistant ID is missing in env!");
        }
        await vapi.start(assistantId);
        console.log("Vapi call started successfully");
      } catch (error) {
        console.error("Failed to start Vapi call:", error);
        setIsConnecting(false);
        throw error;
      }
    } else {
      console.error("Vapi instance not initialized");
      setIsConnecting(false);
    }
  };

  const endCall = () => {
    if (vapi) {
      try {
        vapi.stop();
        console.log("Vapi call ended successfully");
      } catch (error) {
        console.error("Failed to end Vapi call:", error);
      }
    } else {
      console.error("Vapi instance not initialized");
    }
  };

  return {
    isSpeaking,
    isConnecting,
    isConnected,
    transcript,
    startCall,
    endCall,
  };
};
