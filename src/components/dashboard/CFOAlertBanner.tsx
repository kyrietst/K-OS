"use client";

/**
 * CFO Alert Banner - Real-Time Budget Alerts
 * Subscribes to ai_actions table and displays CFO Agent warnings
 */

import { useEffect, useState } from "react";
import { Alert } from "@heroui/react";
import { createClient } from "@/lib/supabase/client";
// Fix import path - actions is in parent directory relative to src/components/dashboard? 
// No, actions is in src/app/dashboard/actions.ts. 
// Component is in src/components/dashboard/CFOAlertBanner.tsx
// So path should be "@/app/dashboard/actions"
import type { CFOAlert } from "@/app/dashboard/actions";

interface CFOAlertBannerProps {
  workspaceId: string;
}

export function CFOAlertBanner({ workspaceId }: CFOAlertBannerProps) {
  const [alerts, setAlerts] = useState<CFOAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Initial fetch
    loadAlerts();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`cfo_alerts_${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ai_actions",
          filter: `agent_name=eq.CFOAgent`,
        },
        (payload) => {
          const newAlert = payload.new as CFOAlert;
          
          // Only add if it's for this workspace and pending
          if (
            newAlert.metadata?.workspace_id === workspaceId &&
            newAlert.status === "pending"
          ) {
            setAlerts((prev) => [newAlert, ...prev]);
          }
        }
      )
      .subscribe();

    async function loadAlerts() {
      try {
        // Cast supabase to any to bypass missing type definition for ai_actions
        const { data, error } = await (supabase as any)
          .from("ai_actions")
          .select("*")
          .eq("agent_name", "CFOAgent")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) {
          console.error("[CFOAlertBanner] Load error:", error);
          setIsLoading(false);
          return;
        }

        // Filter by workspace
        const filtered = (data || []).filter(
          (alert: CFOAlert) => alert.metadata?.workspace_id === workspaceId
        );
        
        setAlerts(filtered);
        setIsLoading(false);
      } catch (err) {
        console.error("[CFOAlertBanner] Fatal error:", err);
        setIsLoading(false);
      }
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId]);

  if (isLoading) {
    return null; // Or skeleton loader
  }

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          color="warning"
          className="border-l-4 border-l-warning-500"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 text-2xl">🚨</div>
            <div className="flex-1">
              <div className="font-semibold text-warning-700 dark:text-warning-400 mb-1">
                CFO Alert: {alert.metadata.client_name}
              </div>
              <div className="text-sm text-foreground/80 leading-relaxed">
                {alert.reasoning}
              </div>
              <div className="mt-2 flex gap-4 text-xs text-foreground/60">
                <span>
                  Budget Variance:{" "}
                  <strong className="text-danger-600">
                    R${alert.metadata.budget_variance.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </strong>
                </span>
                <span>
                  ({alert.metadata.variance_percentage.toFixed(1)}% over)
                </span>
              </div>
            </div>
          </div>
        </Alert>
      ))}
    </div>
  );
}
