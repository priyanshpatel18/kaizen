import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Workspace } from "@/store/workspace";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";
import { UpdateDataProps } from "@/lib/UpdateStoreData";

interface IProps {
  setActiveDialog: Dispatch<SetStateAction<"project" | "workspace" | null>>;
  setProps?: Dispatch<SetStateAction<UpdateDataProps | undefined>>;
  action: "create" | "update" | undefined;
}

export default function WorkspaceForm({ setActiveDialog, setProps }: IProps) {
  const [workspaceName, setWorkspaceName] = useState<string>("");

  async function createWorkspace(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!workspaceName) {
      return toast.error("Please enter a workspace name");
    }

    try {
      const res = await fetch("/api/workspace/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: workspaceName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return toast.error(data.message);
      }

      console.log(data);

      if (setProps && (data.workspace as Workspace)) {
        setProps({
          data: data.workspace,
          action: "create",
          type: "workspace",
        });
      }

      toast.success(data.message);
      setActiveDialog(null);
    } catch (error) {
      toast.error("Something went wrong, please try again");
      console.log(error);
    } finally {
      setWorkspaceName("");
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create Workspace</DialogTitle>
      </DialogHeader>
      <form onSubmit={createWorkspace} className="flex flex-col space-y-4">
        <Label>
          <span className="sr-only">Enter Task Title</span>
          <Input
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            placeholder="Workspace Name"
            type="text"
          />
        </Label>
        <Button>
          <span>Create Workspace</span>
        </Button>
      </form>
    </DialogContent>
  );
}
