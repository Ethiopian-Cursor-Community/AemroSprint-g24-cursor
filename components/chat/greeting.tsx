import { motion } from "framer-motion";

export const Greeting = () => {
  return (
    <div className="flex flex-col items-center px-4" key="overview">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-4"
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="size-1 w-[24px] rounded-full bg-primary" />
        <span className="font-bold text-xs uppercase tracking-[0.3em] text-primary/80">
          AemroSprint
        </span>
        <div className="size-1 w-[24px] rounded-full bg-primary" />
      </motion.div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-center font-bold text-3xl tracking-tight text-foreground md:text-5xl bg-gradient-to-br from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        Your AI academic survival system
      </motion.div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 text-center text-muted-foreground/60 text-sm md:text-base max-w-md leading-relaxed"
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        Upload a syllabus, get a structured study roadmap, quiz yourself, and
        master your courses with AI.
      </motion.div>
    </div>
  );
};
