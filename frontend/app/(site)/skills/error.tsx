"use client";

import React, { useEffect } from "react";
import { ServerWarmingScreen } from "@/components/ServerWarmingScreen";

export default function SkillsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.warn("[Skills] Rendering error caught by boundary:", error);
  }, [error]);

  return (
    <ServerWarmingScreen
      title="Skills Engine Is Waking Up"
      subtitle="The skills microservice was resting to save cloud resources. We're connecting to Google Sheets and waking up the runtime right now!"
    />
  );
}