"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import styles from "./callback.module.css";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (!supabase) {
        console.error("Supabase not configured");
        router.push("/auth");
        return;
      }

      try {
        console.log("Auth callback - URL:", window.location.href);
        console.log("Auth callback - Hash:", window.location.hash);
        
        // Check URL hash for OAuth tokens
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const error = hashParams.get("error");
        const errorDescription = hashParams.get("error_description");
        
        console.log("Auth callback - Hash params:", { accessToken, error, errorDescription });
        
        if (error) {
          console.error("OAuth error:", error, errorDescription);
          router.push(`/auth?error=${error}&description=${errorDescription}`);
          return;
        }
        
        if (accessToken) {
          // Exchange the access token for a session
          console.log("Exchanging access token for session...");
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get("refresh_token") || "",
          });
          
          if (sessionError) {
            console.error("Session error:", sessionError);
            router.push("/auth?error=session_failed");
            return;
          }
          
          console.log("Session established:", sessionData.session);
          router.push("/");
          return;
        }
        
        // If no access token in hash, check existing session
        const { data, error: sessionError } = await supabase.auth.getSession();
        console.log("Auth callback - Session check:", { data, sessionError });
        
        if (sessionError) {
          console.error("Auth callback error:", sessionError);
          router.push("/auth?error=auth_failed");
          return;
        }

        if (data.session) {
          console.log("Session found, redirecting to home");
          router.push("/");
        } else {
          console.log("No session found, redirecting to auth");
          router.push("/auth?error=no_session");
        }
      } catch (err) {
        console.error("Auth callback exception:", err);
        router.push("/auth?error=unknown");
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
