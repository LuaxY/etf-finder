import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, ChartLine, Filter, Search, Sparkles } from "lucide-react";

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
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -8 }}
			transition={{ duration: 0.3 }}
			className="mx-auto mt-10 w-full max-w-4xl"
		>
			{/* Status indicator */}
			<div className="mb-6 flex flex-col items-center gap-3">
				<div className="relative">
					{/* Outer pulse ring */}
					<motion.div
						className="absolute -inset-2 rounded-2xl bg-primary/10"
						animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
						transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
					/>
					<div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
						<AnimatePresence mode="wait">
							<motion.div
								key={step}
								initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
								animate={{ scale: 1, opacity: 1, rotate: 0 }}
								exit={{ scale: 0.5, opacity: 0, rotate: 20 }}
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
							key={step}
							initial={{ opacity: 0, y: 6 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -6 }}
							transition={{ duration: 0.2 }}
							className="text-sm font-medium text-gray-700"
						>
							{current.label}
						</motion.p>
					</AnimatePresence>
					<p className="mt-1 text-xs text-gray-400">
						This usually takes 15-30 seconds
					</p>
				</div>

				{/* Step dots */}
				<div className="flex gap-1.5">
					{STEPS.map((_, i) => (
						<motion.div
							key={i}
							className="h-1 rounded-full"
							animate={{
								width: i === step ? 20 : 6,
								backgroundColor: i === step ? "#0f766e" : i < step ? "#99f6e4" : "#e5e7eb",
							}}
							transition={{ duration: 0.3 }}
						/>
					))}
				</div>
			</div>

			{/* Skeleton cards */}
			<div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
				{Array.from({ length: 5 }).map((_, i) => (
					<motion.div
						key={i}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: i * 0.08, duration: 0.3 }}
						className={`flex items-center gap-4 px-5 py-4 ${i < 4 ? "border-b border-gray-100" : ""}`}
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
