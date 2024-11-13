"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const projectNames = ["Personal", "Work", "Education"];

export default function UseCasePage() {
  const [selected, setSelected] = useState<string[]>([]);
  const router = useRouter();

  async function handleContinue() {
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
    setTimeout(() => {
      router.push("/");
    }, 500);
  }

  return (
    <div className="relative flex w-full max-w-lg flex-col justify-center space-y-8 rounded-lg bg-white p-8 shadow-lg">
      <div className="flex flex-col space-y-3 text-center">
        <h1 className="text-3xl font-semibold text-gray-900">
          How do you want to use Kaizen?
        </h1>
        <p className="text-base text-gray-600">Choose all that apply</p>
      </div>

      <div className="flex flex-col items-center">
        <div className="flex flex-col gap-4 items-start">
          {projectNames.map((projectName) => (
            <div key={projectName} className="flex items-center space-x-3">
              <Checkbox
                checked={selected.includes(projectName)}
                onCheckedChange={(checked) =>
                  checked
                    ? setSelected([...selected, projectName])
                    : setSelected(
                        selected.filter((item) => item !== projectName)
                      )
                }
                id={projectName}
                className="h-5 w-5 cursor-pointer"
              />
              <label
                htmlFor={projectName}
                className="cursor-pointer text-lg text-gray-700"
              >
                {projectName}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Button
        className="w-full py-3 text-lg font-medium"
        disabled={selected.length === 0}
        onClick={handleContinue}
      >
        Continue to Kaizen
      </Button>
    </div>
  );
}
