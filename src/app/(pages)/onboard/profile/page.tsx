"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [name, setName] = useState<string>("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const name = localStorage.getItem("name")?.trim();

    if (name?.length !== 0) {
      router.back();
    }
  }, []);

  async function createProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!name) {
        return toast.error("Please enter your name");
      }

      const formData = new FormData();
      formData.append("name", name);
      if (profileImage) {
        formData.append("profile", profileImage);
      }

      const res = await fetch("/api/onboard/create-profile", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/sign-in");
        }
        return toast.error(data.message);
      } else {
        toast.success(data.message);

        localStorage.setItem("profilePicture", data.profilePicture);
        localStorage.setItem("name", data.name);

        router.push("/onboard/use-case");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image")) {
        toast.error("Please select an image file");
        return;
      }
      setProfileImage(file);
    }
  }

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-col justify-center space-y-6 rounded-lg bg-white p-6 shadow-lg sm:p-8">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-800">Welcome to Kaizen!</h1>
        <p className="text-sm text-gray-600">Enter your name to get started</p>
      </div>

      <form className="space-y-4" onSubmit={createProfile}>
        <label htmlFor="profile">
          <span className="text-sm font-semibold">Profile Picture</span>
          <Input
            type="file"
            accept="image/*"
            placeholder="Choose your profile picture"
            className="w-full cursor-pointer"
            id="profile"
            onChange={handleFileChange}
          />
        </label>

        <Input
          type="text"
          placeholder="Enter your name"
          className="w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Get Started
        </Button>
      </form>
    </div>
  );
}
