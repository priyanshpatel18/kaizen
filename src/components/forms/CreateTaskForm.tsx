"use client";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import UpdateStoreData from "@/lib/UpdateStoreData";
import { cn } from "@/lib/utils";
import { Option, Project, Workspace } from "@/store";
import { Task } from "@/store/task";
import { useCategoryStore } from "@/store/category";
import { useProjectStore } from "@/store/project";
import { Check, ChevronsUpDown } from "lucide-react";
import { Dispatch, FormEvent, SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";
import { Calendar } from "../ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import CalendarIcon from "@/components/svg/CalendarIcon";

interface IProps {
  workspaces?: Workspace[] | null;
  setShowDialog: Dispatch<SetStateAction<boolean>>;
  taskOption?: Option | null;
  project?: Project | null;
}

interface UpdateProps {
  task: Task;
  action: "create" | "update";
}

export default function CreateTaskForm({ setShowDialog }: IProps) {
  const [taskTitle, setTaskTitle] = useState<string>("");
  const [taskDescription, setTaskDescription] = useState<string>("");
  const [taskDate, setTaskDate] = useState<Date | undefined>(undefined);

  const [list, setList] = useState<Option[]>([]);
  const [currentState, setCurrentState] = useState<Option | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { categories: storeCategories } = useCategoryStore();
  const { projects: storeProjects } = useProjectStore();

  const [props, setProps] = useState<UpdateProps | undefined>(undefined);

  useEffect(() => {
    setIsLoading(false);
  });

  useEffect(() => {
    setTaskTitle("");

    if (storeProjects && storeCategories) {
      const options: Option[] = storeProjects.flatMap((p) => {
        return storeCategories
          .filter((c) => p.categoryIds.includes(c.id))
          .map((c) => ({
            value: `${p.id} # ${c.id}`,
            label: `${p.name}${c.isDefault ? "" : ` # ${c.name}`}`,
          }));
      });
      setList(options);
    }
  }, [storeProjects]);

  async function createTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!taskTitle) {
      setIsLoading(false);
      return toast.error("Task title is required");
    }
    if (!currentState) {
      setIsLoading(false);
      return toast.error("Select a Category to create a task");
    }

    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("title", taskTitle);
      formData.append("categoryId", currentState.value.split("#")[1].trim());
      if (taskDescription) {
        formData.append("description", taskDescription);
      }
      if (taskDate) {
        formData.append("dueDate", taskDate.toISOString());
      }

      setProps(undefined);

      const res = await fetch("/api/task/create", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);

        const task = data.task as Task;

        if (typeof task.title === "string") {
          setProps({
            task,
            action: "create",
          });
        }

        setTaskTitle("");
        setTaskDescription("");
        setShowDialog(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(true);
    }
  }

  return (
    <DialogContent>
      {props && <UpdateStoreData data={props.task} type="task" action={props.action} />}

      <DialogHeader>
        <DialogTitle>Create Task</DialogTitle>
      </DialogHeader>
      <form onSubmit={createTask} className="flex flex-col space-y-4">
        <Label>
          <span className="sr-only">Enter Task Title</span>
          <Input
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Title"
            type="text"
            className="text-gray-900"
          />
        </Label>
        <Label>
          <span className="sr-only">Enter Task Title</span>
          <Input
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            placeholder="Description (Optional)"
            type="text"
            className="text-gray-900"
          />
        </Label>

        <div className="flex space-x-4">
          <ComboBox list={list} currentState={currentState} setCurrentState={setCurrentState} />
          <DateSelection date={taskDate} setDate={setTaskDate} />
        </div>

        <Button disabled={isLoading} type="submit">
          <span>Create Task</span>
        </Button>
      </form>
    </DialogContent>
  );
}

interface ComboBoxProps {
  list: Option[];
  currentState: Option | null;
  setCurrentState: Dispatch<SetStateAction<Option | null>>;
}

function ComboBox({ list, currentState, setCurrentState }: ComboBoxProps) {
  const [open, setOpen] = useState<boolean>(false);

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
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-1/2 justify-between">
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
                <CommandItem key={index} onSelect={() => handleSelect(v.value)} className="cursor-pointer">
                  <Check
                    className={cn("mr-2 h-4 w-4", currentState?.value === v?.value ? "opacity-100" : "opacity-0")}
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

interface DateSelectionProps {
  date: Date | undefined;
  setDate: Dispatch<SetStateAction<Date | undefined>>;
}

function DateSelection({ date, setDate }: DateSelectionProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [year, setYear] = useState<number>(2024);
  const [years, setYears] = useState<string[]>([]);

  const today = new Date();

  useEffect(() => {
    const currentYear = today.getFullYear();
    const years: string[] = [];

    for (let index = 0; index < 5; index++) {
      years.push((currentYear + index).toString());
    }
    setDate(today);
    setYear(currentYear);
    setYears(years);
  }, []);

  function handleYearChange(value: string) {
    const selectedYear = parseInt(value);

    if (date) {
      const updatedDate = new Date(new Date(selectedYear, date.getMonth(), date.getDate()));
      setDate(updatedDate);
    }

    setYear(selectedYear);
  }

  function handledateSelection(value: Date | undefined) {
    if (!value) {
      return;
    }

    setDate(value);
    setCalendarOpen(false);
  }

  return (
    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
      <PopoverTrigger asChild>
        <Button variant={"outline"} className="w-1/2 justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col items-center">
          {/* Year Selection */}
          <Select onValueChange={handleYearChange} value={year.toString()}>
            <SelectTrigger className="w-[80%]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Calendar */}
          <Calendar
            key={year}
            mode="single"
            selected={date}
            onSelect={(value) => handledateSelection(value)}
            initialFocus
            fromDate={today}
            defaultMonth={date}
            toDate={new Date(year + 5, 11, 31)}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
