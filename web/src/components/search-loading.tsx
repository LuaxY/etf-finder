import { AnimatePresence, motion } from "framer-motion";
import {
  BrainCircuit,
  ChartLine,
  Filter,
  Search,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";

function getStepColor(i: number, step: number): string {
  return i < step ? "#99f6e4" : "#e5e7eb";
}

const STEPS = [
  { icon: Search, label: "Analyzing your query" },
  { icon: BrainCircuit, label: "AI is researching ETFs" },
  { icon: Filter, label: "Filtering best matches" },
  { icon: ChartLine, label: "Gathering market data" },
  { icon: Sparkles, label: "Preparing recommendations" },
];

export function SearchLoading() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % STEPS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const current = STEPS[step];

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 w-full"
      exit={{ opacity: 0, y: -8 }}
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.3 }}
    >
      {/* Status indicator */}
      <div className="mb-6 flex flex-col items-center gap-3">
        <div className="relative">
          {/* Outer pulse ring */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
            className="absolute -inset-2 rounded-2xl bg-primary/10"
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <AnimatePresence mode="wait">
              <motion.div
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.5, opacity: 0, rotate: 20 }}
                initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                key={step}
                transition={{ duration: 0.25 }}
              >
                <current.icon className="h-5 w-5 text-primary" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="text-center">
          <AnimatePresence mode="wait">
            <motion.p
              animate={{ opacity: 1, y: 0 }}
              className="font-medium text-gray-700 text-sm"
              exit={{ opacity: 0, y: -6 }}
              initial={{ opacity: 0, y: 6 }}
              key={step}
              transition={{ duration: 0.2 }}
            >
              {current.label}
            </motion.p>
          </AnimatePresence>
          <p className="mt-1 text-gray-400 text-xs">
            This usually takes 15-30 seconds
          </p>
        </div>

        {/* Step dots */}
        <div className="flex gap-1.5">
          {STEPS.map((s, i) => (
            <motion.div
              animate={{
                width: i === step ? 20 : 6,
                backgroundColor: i === step ? "#0f766e" : getStepColor(i, step),
              }}
              className="h-1 rounded-full"
              key={s.label}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>

      {/* Skeleton cards */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            animate={{ opacity: 1 }}
            className={`flex items-center gap-4 px-5 py-4 ${i < 4 ? "border-gray-100 border-b" : ""}`}
            initial={{ opacity: 0 }}
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            key={i}
            transition={{ delay: i * 0.08, duration: 0.3 }}
          >
            {/* Symbol skeleton */}
            <div
              className="h-7 w-16 shrink-0 animate-pulse rounded-md bg-gray-100"
              style={{ animationDelay: `${i * 150}ms` }}
            />

            {/* Name + provider skeleton */}
            <div className="min-w-0 flex-1 space-y-1.5">
              <div
                className="h-3.5 animate-pulse rounded bg-gray-100"
                style={{
                  width: `${55 + i * 7}%`,
                  animationDelay: `${i * 150 + 50}ms`,
                }}
              />
              <div
                className="h-2.5 w-24 animate-pulse rounded bg-gray-50"
                style={{ animationDelay: `${i * 150 + 100}ms` }}
              />
            </div>

            {/* Perf skeleton */}
            <div className="hidden shrink-0 space-y-1.5 sm:block">
              <div
                className="ml-auto h-3.5 w-14 animate-pulse rounded bg-gray-100"
                style={{ animationDelay: `${i * 150 + 75}ms` }}
              />
              <div
                className="ml-auto h-2.5 w-6 animate-pulse rounded bg-gray-50"
                style={{ animationDelay: `${i * 150 + 125}ms` }}
              />
            </div>

            {/* MER skeleton */}
            <div className="hidden shrink-0 space-y-1.5 sm:block">
              <div
                className="ml-auto h-3.5 w-12 animate-pulse rounded bg-gray-100"
                style={{ animationDelay: `${i * 150 + 75}ms` }}
              />
              <div
                className="ml-auto h-2.5 w-8 animate-pulse rounded bg-gray-50"
                style={{ animationDelay: `${i * 150 + 125}ms` }}
              />
            </div>

            {/* Country bar skeleton */}
            <div className="hidden shrink-0 space-y-1.5 lg:block">
              <div
                className="h-1.5 w-24 animate-pulse rounded-full bg-gray-100"
                style={{ animationDelay: `${i * 150 + 90}ms` }}
              />
              <div
                className="h-2.5 w-16 animate-pulse rounded bg-gray-50"
                style={{ animationDelay: `${i * 150 + 140}ms` }}
              />
            </div>

            {/* Chevron skeleton */}
            <div
              className="h-4 w-4 shrink-0 animate-pulse rounded bg-gray-100"
              style={{ animationDelay: `${i * 150 + 100}ms` }}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
