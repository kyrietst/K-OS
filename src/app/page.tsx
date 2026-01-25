'use client'

import { Button } from "@heroui/react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background p-4">
      <h1 className="text-4xl font-bold text-foreground">KyrieOS</h1>
      <p className="text-large text-default-500">Operating System for Agencies</p>
      <div className="flex gap-4">
        <Link href="/login">
          <Button className="bg-primary text-white">
            Get Started
          </Button>
        </Link>
        <Button variant="ghost">
          Documentation
        </Button>
      </div>
    </div>
  );
}
