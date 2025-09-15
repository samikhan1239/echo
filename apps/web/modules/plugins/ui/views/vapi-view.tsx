"use client";

import { GlobeIcon, PhoneCallIcon, PhoneIcon, WorkflowIcon } from "lucide-react";
import { type Feature, PluginCard } from "../components/plugin-card";
import { useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";
import { VapiConnectedView } from "../components/vapi-connected-view";

const vapiFeatures: Feature[] = [
  {
    icon: GlobeIcon,
    label: "Web voice calls",
    description: "Voice chat directly in your app",
  },
  {
    icon: PhoneIcon,
    label: "Phone numbers",
    description: "Get dedicated business lines",
  },
  {
    icon: PhoneCallIcon,
    label: "Outbound calls",
    description: "Automated customer outreach",
  },
  {
    icon: WorkflowIcon,
    label: "Workflows",
    description: "Custom conversation flows",
  },
];

const VapiPluginForm = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) => {
  const addPlugin = useMutation(api.private.plugins.add);

  const onSubmit = async () => {
    try {
      await addPlugin({ service: "vapi" });
      setOpen(false);
      toast.success("VAPI plugin connected");
    } catch (error) {
      console.error(error);
      toast.error("Failed to connect VAPI plugin");
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enable VAPI</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Connecting VAPI plugin using shared API keys. No setup required!
        </DialogDescription>
        <DialogFooter>
          <Button
            onClick={onSubmit}
            disabled={false}
          >
            Connect
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const VapiPluginRemoveForm = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) => {
  const removePlugin = useMutation(api.private.plugins.remove);

  const onSubmit = async () => {
    try {
      await removePlugin({ service: "vapi" });
      setOpen(false);
      toast.success("VAPI plugin removed");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Disconnect VAPI</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to disconnect the VAPI plugin?
        </DialogDescription>
        <DialogFooter>
          <Button onClick={onSubmit} variant="destructive">
            Disconnect
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const VapiView = () => {
  const vapiPlugin = useQuery(api.private.plugins.getOne, { service: "vapi" });
  const [connectOpen, setConnectOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  const toggleConnection = () => {
    if (vapiPlugin) {
      setRemoveOpen(true);
    } else {
      setConnectOpen(true);
    }
  };

  return (
    <>
      <VapiPluginForm open={connectOpen} setOpen={setConnectOpen} />
      <VapiPluginRemoveForm open={removeOpen} setOpen={setRemoveOpen} />
      <div className="flex min-h-screen flex-col bg-muted p-8">
        <div className="mx-auto w-full max-w-screen-md">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl">VAPI Plugin</h1>
            <p className="text-muted-foreground">
              Connect VAPI to enable AI voice calls and phone support
            </p>
          </div>
          <div className="mt-8">
            {vapiPlugin ? (
              <VapiConnectedView onDisconnect={toggleConnection} />
            ) : (
              <PluginCard
                serviceImage="/vapi.jpg"
                serviceName="VAPI"
                features={vapiFeatures}
                isDisabled={false} // Always enabled since keys are in env
                onSubmit={toggleConnection}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};