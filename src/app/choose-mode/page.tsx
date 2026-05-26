"use client";

import { useEffect } from "react";

import { ChooseModePage } from "@/features/modeSelect";
import { useGameplayStore } from "@/features/gameplay";
import { useStoryStore } from "@/features/story/store";

export default function ChooseModeRoutePage() {
  const resetSession = useGameplayStore((state) => state.resetSession);
  const resetStory = useStoryStore((state) => state.reset);

  useEffect(() => {
    resetSession();
    resetStory();
  }, [resetSession, resetStory]);

  return <ChooseModePage />;
}
