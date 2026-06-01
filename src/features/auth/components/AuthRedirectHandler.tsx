"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { APP_ROUTES } from "@/constants/appConstants";
import { supabase } from "@/lib/supabase";

export function AuthRedirectHandler() {
  const router = useRouter();

  useEffect(() => {
    const handleHashCallback = async () => {
      if (!supabase) return;
      if (!window.location.hash.includes("access_token")) return;

      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const error = hashParams.get("error");
      const errorDescription = hashParams.get("error_description");

      if (error) {
        window.history.replaceState({}, document.title, window.location.pathname);
        router.replace(`${APP_ROUTES.auth}?error=${error}&description=${errorDescription ?? ""}`);
        return;
      }

      if (!accessToken || !refreshToken) return;

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      window.history.replaceState({}, document.title, window.location.pathname);

      if (sessionError) {
        router.replace(`${APP_ROUTES.auth}?error=session_failed`);
        return;
      }

      router.replace(APP_ROUTES.menu);
    };

    void handleHashCallback();
  }, [router]);

  return null;
}
