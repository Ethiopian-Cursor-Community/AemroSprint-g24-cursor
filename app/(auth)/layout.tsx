import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { SparklesIcon } from "@/components/chat/icons";
import { Preview } from "@/components/chat/preview";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh w-screen bg-sidebar overflow-hidden">
      <div className="flex w-full flex-col bg-background/80 backdrop-blur-xl p-8 xl:w-[560px] xl:shrink-0 xl:rounded-r-[2rem] xl:border-r xl:border-border/10 md:p-16 z-10">
        <Link
          className="flex w-fit items-center gap-2 text-[13px] font-medium text-muted-foreground/60 transition-all hover:text-primary hover:translate-x-[-2px]"
          href="/"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to AemroSprint
        </Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-12">
          <div className="flex flex-col gap-4">
            <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 shadow-glow">
              <SparklesIcon size={18} />
            </div>
            {children}
          </div>
        </div>
      </div>

      <div className="hidden flex-1 flex-col overflow-hidden pl-16 xl:flex bg-gradient-to-br from-sidebar via-sidebar to-background relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,oklch(0.7_0.15_250/_0.03),transparent_50%)]" />
        <div className="flex items-center gap-2 pt-12 text-[13px] tracking-tight">
          <span className="font-bold text-foreground/80 uppercase">
            AemroSprint
          </span>
          <span className="text-muted-foreground/30">·</span>
          <span className="text-muted-foreground/60 font-medium">Your AI academic survival system</span>
        </div>
        <div className="flex-1 pt-8">
          <Preview />
        </div>
      </div>
    </div>
  );
}
