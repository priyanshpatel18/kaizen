import { cn } from "@/lib/utils";
import { useStore } from "@/store";
import { Check, ChevronsUpDown } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Data } from "./CreateTask";

interface IProps {
  currentState: Data | null;
  setCurrentState: Dispatch<SetStateAction<Data | null>>;
}

export default function ComboBox({ currentState, setCurrentState }: IProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [list, setList] = useState<Data[]>([]);
  const { taskComboBox } = useStore();

  useEffect(() => {
    if (taskComboBox) {
      const newList = taskComboBox.map((v) => ({
        label: `${v.projectName} # ${v.categoryName}`,
        value: `${v.projectId} # ${v.categoryId}`,
      }));

      setList(newList);

      if (newList.length > 0 && !currentState) setCurrentState(newList[0]);
    }
  }, [taskComboBox]);

  const handleSelect = (newValue: string) => {
    const selected = list.find((item) => item.value === newValue);
    if (selected) {
      setCurrentState(selected);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-1/2 justify-between"
        >
          {currentState?.label || "Select an option"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search project name" />
          <CommandList>
            <CommandGroup>
              {list.map((v, index) => (
                <CommandItem
                  key={index}
                  onSelect={() => handleSelect(v.value)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentState?.value === v?.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {v.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
