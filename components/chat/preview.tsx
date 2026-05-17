"use client";

import { useRouter } from "next/navigation";
import { suggestions } from "@/lib/constants";
import { SparklesIcon } from "./icons";

export function Preview() {
  const router = useRouter();

  const handleAction = (query?: string) => {
    const url = query ? `/?query=${encodeURIComponent(query)}` : "/";
    router.push(url);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-tl-3xl bg-background/50 backdrop-blur-sm border-l border-t border-border/10">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border/10 px-6 bg-secondary/20">
        <div className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
          <SparklesIcon size={12} />
        </div>
        <span className="text-[13px] font-semibold text-foreground/80 tracking-wide uppercase">
          AemroSprint
        </span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-10 px-10">
        <div className="text-center space-y-3">
          <h2 className="font-bold text-2xl md:text-3xl tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
            Master your courses
          </h2>
          <p className="max-w-xs mx-auto text-muted-foreground text-sm leading-relaxed">
            Upload course material, get roadmaps, and quiz yourself with AI.
          </p>
        </div>

        <div className="grid w-full max-w-md grid-cols-2 gap-3">
          {suggestions.map((suggestion) => (
            <button
              className="group relative overflow-hidden rounded-2xl border border-border/20 bg-card/40 px-4 py-3.5 text-left text-[12px] font-medium leading-snug text-muted-foreground transition-all duration-300 hover:border-primary/30 hover:bg-card/60 hover:text-foreground hover:scale-[1.02]"
              key={suggestion}
              onClick={() => handleAction(suggestion)}
              type="button"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <div className="shrink-0 px-8 pb-8">
        <button
          className="flex w-full items-center gap-3 rounded-2xl border border-border/10 bg-secondary/40 px-5 py-4 text-left text-[14px] text-muted-foreground/60 transition-all hover:border-primary/20 hover:bg-secondary/60 hover:text-muted-foreground group"
          onClick={() => handleAction()}
          type="button"
        >
          <div className="size-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
          Ask anything about your studies...
        </button>
      </div>
    </div>
  );
}
