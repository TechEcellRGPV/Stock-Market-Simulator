import { useEffect, useRef, useCallback } from "react";

/**
 * @file useScreenWakeLock.js
 * @description Mobile Screen Wake Lock Sentinel for Imprenditore 5.0.
 * Prevents mobile phone screens from dimming or sleeping while participants
 * monitor real-time telemetry or active trading laps. Automatically re-acquires
 * the lock when the user switches back from background apps.
 *
 * @param {boolean} [enabled=true] - Whether the wake lock should be held active
 */
export function useScreenWakeLock(enabled = true) {
  const wakeLockRef = useRef(null);

  const requestLock = useCallback(async () => {
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) {
      return;
    }
    try {
      if (!wakeLockRef.current || wakeLockRef.current.released) {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
      }
    } catch {
      // Handled gracefully: device battery saver or OS power policies may reject
      wakeLockRef.current = null;
    }
  }, []);

  const releaseLock = useCallback(async () => {
    if (wakeLockRef.current && !wakeLockRef.current.released) {
      try {
        await wakeLockRef.current.release();
      } catch {
        // Ignored
      }
      wakeLockRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      releaseLock();
      return;
    }

    requestLock();

    // Mobile OS releases wake lock on backgrounding: re-acquire when user returns
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && enabled) {
        requestLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      releaseLock();
    };
  }, [enabled, requestLock, releaseLock]);
}
