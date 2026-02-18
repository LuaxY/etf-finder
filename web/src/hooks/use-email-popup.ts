import { useCallback, useRef, useState } from "react";

const STORAGE_KEY = "etf-email-popup-dismissed";

export function useEmailPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const hasTriggeredRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const notifyExpansion = useCallback(() => {
    if (hasTriggeredRef.current) {
      return;
    }
    if (localStorage.getItem(STORAGE_KEY)) {
      return;
    }

    hasTriggeredRef.current = true;
    timerRef.current = setTimeout(() => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setIsOpen(true);
      }
    }, 3000);
  }, []);

  const dismiss = useCallback(() => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, "1");
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  return { isOpen, setIsOpen, dismiss, notifyExpansion };
}
