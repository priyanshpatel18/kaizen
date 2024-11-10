"use client";

import ConnectionStatus from "@/components/ConnectionStatus";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUserSocket } from "@/hooks/useUserSocket";
import { CONNECTED } from "@/messages";
import { Label } from "@prisma/client";
import { useSession } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

export default function TestPage() {
  const { data } = useSession();
  
  const { socket, connectionType } = useUserSocket();
  const [labels, setLabels] = useState<Label[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [labelName, setLabelName] = useState<string>("");

  async function getLabels() {
    const res = await fetch("/api/label/get-labels", {
      method: "GET",
    });
    if (!res.ok) {
      return;
    }

    const data = await res.json();
    if (data.labels) {
      setLabels(data.labels);
    } else {
      setLabels([]);
    }
  }

  useEffect(() => {
    getLabels();

    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      const messageData = JSON.parse(event.data);
      if (messageData.type === CONNECTED) {
        console.log(CONNECTED);
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket]);

  async function createLabel(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!labelName) {
      toast.error("Please enter a label name");
      return;
    }

    try {
      const res = await fetch("/api/label/create-label", {
        method: "POST",
        body: JSON.stringify({
          name: labelName,
        }),
      });
      if (!res.ok) {
        toast.error("Something went wrong, please try again");
        return;
      }

      const data = await res.json();
      if (data.label as Label) {
        setLabels([...labels, data.label]);
        toast.success("Label created successfully");
      } else {
        toast.error("Error creating label");
      }
    } catch (error) {
      toast.error("Something went wrong, please try again");
    } finally {
      setShowDialog(false);
      setLabelName("");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen gap-4 p-6">
      <p className="text-lg font-semibold">{data?.user?.email}</p>

      <ConnectionStatus connectionType={connectionType} />
      <ul className="flex flex-col items-center gap-1 mt-4">
        {labels.map((label) => (
          <li key={label.id} className="font-medium">
            {label.name}
          </li>
        ))}
      </ul>
      <Button className="mt-6" onClick={() => setShowDialog(true)}>
        Create Label
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Label</DialogTitle>
            <DialogDescription>
              <form onSubmit={createLabel} className="flex flex-col gap-4 py-4">
                <Input
                  type="text"
                  placeholder="Label Name"
                  value={labelName}
                  onChange={(e) => setLabelName(e.target.value)}
                />
                <Button className="w-full" type="submit">
                  Create
                </Button>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
