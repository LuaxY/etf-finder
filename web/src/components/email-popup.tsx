import { AnimatePresence, motion } from "framer-motion";
import { Check, Mail } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { subscribe } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface EmailPopupProps {
  isOpen: boolean;
  onDismiss: () => void;
  onOpenChange: (open: boolean) => void;
}

export function EmailPopup({
  isOpen,
  onOpenChange,
  onDismiss,
}: EmailPopupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const hasTrackedOpen = useRef(false);

  useEffect(() => {
    if (isOpen && !hasTrackedOpen.current) {
      track("popup_shown");
      hasTrackedOpen.current = true;
    }
  }, [isOpen]);

  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        onDismiss();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, onDismiss]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      track("popup_dismissed");
      onDismiss();
    }
    onOpenChange(open);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === "submitting") {
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      await subscribe(email.trim());
      setStatus("success");
      track("popup_submitted", { email: email.trim() });
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      <DialogContent className="max-w-sm gap-0 p-0 sm:rounded-xl">
        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center px-6 py-10"
              exit={{ opacity: 0, scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.9 }}
              key="success"
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              <motion.div
                animate={{ scale: 1 }}
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100"
                initial={{ scale: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 15,
                  delay: 0.1,
                }}
              >
                <Check className="h-6 w-6 text-teal-600" />
              </motion.div>
              <p className="font-semibold text-gray-900">You're in!</p>
              <p className="mt-1 text-gray-500 text-sm">
                Check your inbox for a confirmation.
              </p>
            </motion.div>
          ) : (
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              initial={{ opacity: 1, scale: 1 }}
              key="form"
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              <div className="px-6 pt-6 pb-4">
                <DialogHeader className="items-center text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-b from-teal-500 to-teal-600 shadow-[0_2px_10px_rgba(13,148,136,0.25)]">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <DialogTitle className="font-serif text-xl">
                    Stay in the loop
                  </DialogTitle>
                  <DialogDescription className="text-gray-500">
                    Get weekly ETF insights and market trends delivered to your
                    inbox.
                  </DialogDescription>
                </DialogHeader>
              </div>

              <form className="px-6 pb-6" onSubmit={handleSubmit}>
                <div className="space-y-3">
                  <input
                    autoComplete="email"
                    autoFocus
                    className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
                    disabled={status === "submitting"}
                    name="email"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    ref={inputRef}
                    type="email"
                    value={email}
                  />

                  {status === "error" && (
                    <p className="text-red-500 text-xs">{errorMessage}</p>
                  )}

                  <button
                    className="h-11 w-full rounded-lg border border-teal-600/30 bg-gradient-to-b from-teal-500 to-teal-600 font-semibold text-sm text-teal-50 shadow-[0_2px_10px_rgba(13,148,136,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all hover:from-teal-400 hover:to-teal-500 hover:shadow-[0_2px_12px_rgba(13,148,136,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] disabled:opacity-40 disabled:shadow-none"
                    disabled={!email.trim() || status === "submitting"}
                    type="submit"
                  >
                    {status === "submitting" ? "Subscribing..." : "Subscribe"}
                  </button>
                </div>

                <p className="mt-3 text-center text-gray-400 text-xs">
                  No spam, unsubscribe anytime.
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
