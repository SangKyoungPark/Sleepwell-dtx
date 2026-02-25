import { BottomNav } from "@/components/ui/BottomNav";
import { SoundProvider } from "@/contexts/SoundContext";
import { SoundMiniPlayer } from "@/components/ui/SoundMiniPlayer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SoundProvider>
      {children}
      <SoundMiniPlayer />
      <BottomNav />
    </SoundProvider>
  );
}
