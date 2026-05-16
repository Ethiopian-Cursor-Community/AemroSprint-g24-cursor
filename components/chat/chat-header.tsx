"use client";

import { BrainIcon, PanelLeftIcon } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { VisibilitySelector, type VisibilityType } from "./visibility-selector";

function PureChatHeader({
  chatId,
  selectedVisibilityType,
  isReadonly,
}: {
  chatId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const { state, toggleSidebar, isMobile } = useSidebar();

  if (state === "collapsed" && !isMobile) {
    return null;
  }

  return (
    <header className="sticky top-0 flex h-14 items-center gap-2 bg-sidebar/80 backdrop-blur-md px-3 border-b border-border/5 z-20">
      <Button
        className="md:hidden hover:bg-primary/10 hover:text-primary transition-colors"
        onClick={toggleSidebar}
        size="icon-sm"
        type="button"
        variant="ghost"
      >
        <PanelLeftIcon className="size-4" />
      </Button>

      <div className="flex items-center gap-2 md:hidden">
        <BrainIcon className="size-4 text-primary shadow-glow" />
        <span className="font-bold text-sm tracking-tight">AemroSprint</span>
      </div>

      {!isReadonly && (
        <VisibilitySelector
          chatId={chatId}
          selectedVisibilityType={selectedVisibilityType}
        />
      )}

      <div className="hidden items-center gap-2 md:ml-auto md:flex">
        <BrainIcon className="size-4 text-primary" />
        <span className="font-semibold text-muted-foreground/80 text-xs uppercase tracking-widest">
          AemroSprint
        </span>
      </div>
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return (
    prevProps.chatId === nextProps.chatId &&
    prevProps.selectedVisibilityType === nextProps.selectedVisibilityType &&
    prevProps.isReadonly === nextProps.isReadonly
  );
});
