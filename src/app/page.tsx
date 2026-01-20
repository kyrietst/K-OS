'use client'

import { Button } from "@heroui/react";

export default function Home() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background p-4">
      <h1 className="text-4xl font-bold text-foreground">KyrieOS</h1>
      <p className="text-large text-default-500">Operating System for Agencies</p>
      <div className="flex gap-4">
        <Button variant="primary">
          Get Started
        </Button>
        <Button variant="secondary">
          Documentation
        </Button>
      </div>
    </div>
  );
}
