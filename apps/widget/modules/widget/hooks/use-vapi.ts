import Vapi from "@vapi-ai/web";
import { useEffect, useState } from "react";

interface TranscriptMessage {
  role: "user" | "assistant";
  text: string;
}

// Vapi configuration type
interface VapiConfig {
  assistantId: string; // Assistant ID from Vapi Dashboard
}

export const useVapi = () => {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);

  // Vapi configuration with assistant ID
  const vapiConfig: VapiConfig = {
    assistantId: "2afe9809-4acb-4571-9d65-d1779d054e65", // Your provided assistant ID
  };

  useEffect(() => {
    // Initialize Vapi with public key (use environment variable in production)
    const publicKey = "21a45305-7471-438a-af35-45db84e083fa";
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

    // Cleanup on unmount
    return () => {
      vapiInstance.stop();
      setVapi(null);
    };
  }, []);

  const startCall = async () => {
    setIsConnecting(true);
    if (vapi) {
      try {
        await vapi.start(vapiConfig.assistantId); // Pass the assistantId string directly
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