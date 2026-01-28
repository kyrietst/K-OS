"use client";

import { useState, useEffect } from "react";
import { Button, Card, Spinner } from "@heroui/react";
import { CFOAlertBanner } from "./CFOAlertBanner";
import { triggerCFOAnalysis } from "@/app/dashboard/actions";
import { createClient } from "@/lib/supabase/client";

interface CFOSectionProps {
  workspaceId: string;
}

export function CFOSection({ workspaceId }: CFOSectionProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);

  const handleRunAnalysis = async () => {
    try {
      setIsRunning(true);
      const result = await triggerCFOAnalysis(workspaceId);
      if (result?.job_id) {
        setJobId(result.job_id);
      }
    } catch (error) {
      console.error("Failed to start analysis:", error);
      setIsRunning(false);
    }
  };

  // Restore active job state on mount
  useEffect(() => {
    const checkActiveJob = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("jobs")
        .select("id, status")
        .eq("workspace_id", workspaceId)
        .in("status", ["pending", "running"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setJobId(data.id);
        setIsRunning(true);
      }
    };
    
    checkActiveJob();
  }, [workspaceId]);

  // Poll for job status
  useEffect(() => {
    if (!jobId) return;

    const supabase = createClient();
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("jobs")
        .select("status")
        .eq("id", jobId)
        .single();

      if (data) {
        if (data.status === "completed" || data.status === "failed") {
          setIsRunning(false);
          setJobId(null);
          // Optional: Trigger alert refresh via router.refresh() or letting realtime handle it
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId]);

  return (
    <div className="mb-8 space-y-4">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-xl font-bold">Financial Intelligence</h2>
            <p className="text-small text-default-500">
                AI-powered budget and resource allocation analysis
            </p>
        </div>
        <Button 
          variant="secondary"
          isPending={isRunning} 
          onPress={handleRunAnalysis}
        >
          {isRunning ? "Analyzing..." : "Run CFO Audit"}
        </Button>
      </div>

      {isRunning && (
        <Card className="p-4 bg-primary-50 border-primary-100 border">
            <div className="flex items-center gap-3">
                <Spinner size="sm" color="accent" />
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-primary-700">Analysis in progress</span>
                    <span className="text-xs text-primary-600">Checking contracts vs worklogs...</span>
                </div>
            </div>
        </Card>
      )}

      <CFOAlertBanner workspaceId={workspaceId} />
    </div>
  );
}
