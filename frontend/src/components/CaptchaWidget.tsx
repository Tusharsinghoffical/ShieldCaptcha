"use client";

import React, { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { CheckCircle2, RefreshCw } from "lucide-react";

declare global {
  interface Window {
    ShieldCaptcha?: {
      mount: (container: HTMLElement, options: any) => any;
    };
  }
}

interface CaptchaWidgetProps {
  mode: "checkbox" | "jigsaw" | "adaptive";
  onToken: (token: string, meta: any) => void;
  onReset: () => void;
  onTrajectory: (point: any) => void;
  onControllerReady?: (controller: any) => void;
}

export function CaptchaWidget({
  mode,
  onToken,
  onReset,
  onTrajectory,
  onControllerReady,
}: CaptchaWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [controller, setController] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;

    const loadScriptAndMount = async () => {
      if (!window.ShieldCaptcha) {
        const script = document.createElement("script");
        script.src = "/captcha.js";
        script.async = true;
        document.body.appendChild(script);

        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      if (!active || !containerRef.current || !window.ShieldCaptcha) return;

      const c = window.ShieldCaptcha.mount(containerRef.current, {
        mode,
        onToken: (token: string, meta: any) => {
          // Trigger celebratory confetti on human verification!
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
            colors: ["#6366f1", "#38bdf8", "#10b981", "#fbbf24"],
          });
          onToken(token, meta);
        },
        onReset,
        onTrajectory,
      });

      setController(c);
      setIsReady(true);
      if (onControllerReady) onControllerReady(c);
    };

    loadScriptAndMount();

    return () => {
      active = false;
    };
  }, []);

  // Update mode when prop changes
  useEffect(() => {
    try {
      if (controller && typeof controller.switchMode === "function") {
        controller.switchMode(mode);
      }
    } catch (err) {
      console.warn("ShieldCaptcha switchMode exception caught safely:", err);
    }
  }, [mode, controller]);

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[70px] overflow-hidden">
      <div ref={containerRef} className="w-full flex justify-center max-w-full overflow-hidden" />
    </div>
  );
}
