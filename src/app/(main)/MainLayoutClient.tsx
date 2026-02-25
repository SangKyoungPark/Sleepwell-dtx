"use client";

import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/ui/BottomNav";
import { SoundProvider, useSoundContext } from "@/contexts/SoundContext";
import { SoundMiniPlayer } from "@/components/ui/SoundMiniPlayer";
import { SleepSoundPrompt } from "@/components/ui/SleepSoundPrompt";
import { useNotification } from "@/hooks/useNotification";

function BedtimePromptBridge() {
  const router = useRouter();
  const { bedtimePromptVisible, dismissBedtimePrompt } = useNotification();
  const { playPreset } = useSoundContext();

  return (
    <SleepSoundPrompt
      visible={bedtimePromptVisible}
      onStartSound={() => {
        playPreset();
        dismissBedtimePrompt();
        router.push("/relax");
      }}
      onDismiss={dismissBedtimePrompt}
    />
  );
}

export function MainLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <SoundProvider>
      {children}
      <BedtimePromptBridge />
      <SoundMiniPlayer />
      <BottomNav />
    </SoundProvider>
  );
}
