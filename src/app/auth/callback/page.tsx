"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { APP_ROUTES, AUTHENTICATED_HOME_ROUTE } from "@/constants/appConstants";

import styles from "./callback.module.css";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (!supabase) {
        router.push(APP_ROUTES.auth);
        return;
      }

      try {
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get("code");

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            router.push(`${APP_ROUTES.auth}?error=session_failed`);
            return;
          }

          window.history.replaceState({}, document.title, APP_ROUTES.authCallback);
          router.replace(AUTHENTICATED_HOME_ROUTE);
          return;
        }

        // Check URL hash for OAuth tokens
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const error = hashParams.get("error");
        const errorDescription = hashParams.get("error_description");

        if (error) {
          router.push(`${APP_ROUTES.auth}?error=${error}&description=${errorDescription ?? ""}`);
          return;
        }
        
        if (accessToken) {
          // Exchange the access token for a session
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get("refresh_token") || "",
          });
          
          if (sessionError || !sessionData.session) {
            router.push(`${APP_ROUTES.auth}?error=session_failed`);
            return;
          }

          // Clear the hash from URL to prevent re-processing
          window.history.replaceState({}, document.title, APP_ROUTES.authCallback);
          
          router.replace(AUTHENTICATED_HOME_ROUTE);
          return;
        }
        
        // If no access token in hash, check existing session
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          router.push(`${APP_ROUTES.auth}?error=auth_failed`);
          return;
        }

        if (data.session) {
          router.replace(AUTHENTICATED_HOME_ROUTE);
        } else {
          router.push(`${APP_ROUTES.auth}?error=no_session`);
        }
      } catch (err) {
        router.push(`${APP_ROUTES.auth}?error=unknown`);
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className={styles.root} role="status" aria-live="polite">
      <p className={styles.text}>Authenticating... Please wait.</p>
    </div>
  );
}
