"use client";

import { UpdateProps } from "@/components/sidebar/appSidebar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import UpdateStoreData from "@/lib/UpdateStoreData";
import { Project } from "@/store/project";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const projectNames = ["Personal", "Work", "Education"];

export default function UseCasePage() {
  const [selected, setSelected] = useState<string[]>([]);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [props, setProps] = useState<UpdateProps | undefined>(undefined);

  async function handleContinue() {
    setIsLoading(true);

    if (selected.length === 0) {
      return toast.error("Please select at least one project");
    }

    try {
      const formData = new FormData();
      formData.append("projects", JSON.stringify(selected));
      formData.append("usecaseFlag", "true");

      const res = await fetch("/api/project/create", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        return toast.error(data.message);
      }

      toast.success(data.message);
      if (data.projects) {
        data.projects.forEach((project: Project) => {
          setProps({
            data: project,
            action: "create",
            type: "project",
          });
        });
      }

      setTimeout(() => {
        router.push("/app/today");
      }, 500);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong, Please reload and try again");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex w-full max-w-lg flex-col justify-center space-y-8 rounded-lg bg-white p-8 shadow-lg">
      {props && <UpdateStoreData data={props.data} type={props.type} action={props.action} />}

      <div className="flex flex-col space-y-3 text-center">
        <h1 className="text-3xl font-semibold text-gray-900">How do you want to use Kaizen?</h1>
        <p className="text-base text-gray-600">Choose all that apply</p>
      </div>

      <div className="flex flex-col items-center">
        <div className="flex flex-col items-start gap-4">
          {projectNames.map((projectName) => (
            <div key={projectName} className="flex items-center space-x-3">
              <Checkbox
                checked={selected.includes(projectName)}
                onCheckedChange={(checked) =>
                  checked
                    ? setSelected([...selected, projectName])
                    : setSelected(selected.filter((item) => item !== projectName))
                }
                id={projectName}
                className="h-5 w-5 cursor-pointer"
              />
              <label htmlFor={projectName} className="cursor-pointer text-lg text-gray-700">
                {projectName}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Button
        className="w-full py-3 text-lg font-medium"
        disabled={selected.length === 0 || isLoading}
        onClick={handleContinue}
      >
        Continue to Kaizen
      </Button>
    </div>
  );
}
