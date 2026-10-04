"use client";

import { useCallback, useRef, useState } from "react";

let idCounter = 0;

export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const push = useCallback(
    (message, variant = "success", duration = 4000) => {
      const id = ++idCounter;
      setToasts((t) => [...t, { id, message, variant }]);
      timers.current[id] = setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  return { toasts, push, dismiss };
}
