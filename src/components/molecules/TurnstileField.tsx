"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useEffect, useRef, useState } from "react";
import { isTurnstileClientEnabled, TURNSTILE_SITE_KEY } from "@/lib/turnstile";

interface TurnstileFieldProps {
  /** Bump to reset the widget (e.g. after a failed submit). */
  resetKey?: number;
  onVerifiedChange?: (verified: boolean) => void;
}

export function TurnstileField({
  resetKey = 0,
  onVerifiedChange,
}: TurnstileFieldProps) {
  const widgetRef = useRef<TurnstileInstance>(null);
  const [token, setToken] = useState("");
  const prevResetKey = useRef(resetKey);

  useEffect(() => {
    // Skip on first mount — reset() before the widget loads causes console noise.
    if (prevResetKey.current === resetKey) return;
    prevResetKey.current = resetKey;
    setToken("");
    onVerifiedChange?.(false);
    widgetRef.current?.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onVerifiedChange is stable (setState)
  }, [resetKey]);

  if (!isTurnstileClientEnabled()) return null;

  return (
    <>
      <input
        type="hidden"
        name="turnstileToken"
        value={token}
        readOnly
      />
      <Turnstile
        ref={widgetRef}
        siteKey={TURNSTILE_SITE_KEY}
        options={{ theme: "light", size: "normal" }}
        onSuccess={(value) => {
          setToken(value);
          onVerifiedChange?.(true);
        }}
        onExpire={() => {
          setToken("");
          onVerifiedChange?.(false);
          widgetRef.current?.reset();
        }}
        onError={() => {
          setToken("");
          onVerifiedChange?.(false);
        }}
      />
    </>
  );
}
