"use client";

import { useEffect, useState } from "react";
import { AI_SETTINGS_OPEN_EVENT } from "@/lib/ai-storage";
import { AiSettingsDialog } from "@/components/ai-settings-dialog";

export function AiSettingsHost() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleOpen() {
      setOpen(true);
    }

    window.addEventListener(AI_SETTINGS_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(AI_SETTINGS_OPEN_EVENT, handleOpen);
  }, []);

  return <AiSettingsDialog open={open} onOpenChange={setOpen} />;
}
