import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStore, Workspace } from "@/store";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface IProps {
  workspaces: Workspace[] | null;
  setShowWorkspaceForm: Dispatch<SetStateAction<boolean>>;
}

export default function CreateWorkspaceForm({ workspaces, setShowWorkspaceForm }: IProps) {
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const store = useStore();

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

      toast.success(data.message);

      if (workspaces && workspaces.length > 0 && (data.workspace as Workspace)) {
        const updatedWorkspaces = [...workspaces];
        updatedWorkspaces.push(data.workspace);
        store.setWorkspaces(updatedWorkspaces);
      }
      setShowWorkspaceForm(false);
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
            className="text-gray-900"
          />
        </Label>
        <Button>
          <span>Create Workspace</span>
        </Button>
      </form>
    </DialogContent>
  );
}
