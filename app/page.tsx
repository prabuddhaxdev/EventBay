"use client"; // <-- Add this line

import { Button } from "@/components/ui/button";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";

export default function Home() {
  return (
    <div>
      <Authenticated>
        <p>You are signed in!</p>
        <UserButton />
      </Authenticated>

      <Unauthenticated>
        <p>Please sign in to continue</p>
        <SignInButton />
      </Unauthenticated>

      <Button onClick={() => alert("Hello!")}>Click Me</Button>
    </div>
  );
}
