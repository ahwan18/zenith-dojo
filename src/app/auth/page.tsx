"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, User, LogIn, UserPlus, Gamepad2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

import styles from "./auth.module.css";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!supabase) {
        throw new Error("Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      }
      if (isLogin) {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
      } else {
        const { error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;
      }
      router.push("/");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      if (!supabase) {
        throw new Error("Supabase is not configured.");
      }
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = async () => {
    setLoading(true);
    try {
      // Guest mode usually implies a temporary session or a dummy account.
      // For now, we redirect to the main menu as guest.
      router.push("/");
    } catch (err: any) {
      setError("Failed to enter guest mode");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.bgDecor}>
        <div className={styles.circle1} />
        <div className={styles.circle2} />
      </div>

      <motion.div
        className={styles.authCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.header}>
          <div className={styles.logoWrap}>
            <Gamepad2 size={48} className={styles.logoIcon} />
            <h1>MotionQuest</h1>
          </div>
          <p>Enter the Dojo, Master Your Motion</p>
        </div>

        {error && (
          <motion.div
            className={styles.errorBox}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleAuth} className={styles.form}>
          <div className={styles.inputGroup}>
            <Mail className={styles.inputIcon} size={20} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <Lock className={styles.inputIcon} size={20} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.primaryButton} disabled={loading}>
            {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
            {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
          </button>
        </form>

        <div className={styles.divider}>
          <span>OR</span>
        </div>

        <div className={styles.socialAuth}>
          <button onClick={handleGoogleLogin} className={styles.googleButton} disabled={loading || !supabase}>
            <img src="https://www.gstatic.com/firebasejs/ui/ imagery/google.png" alt="Google" className={styles.socialIcon} />
            Continue with Google
          </button>
          <button onClick={handleGuestMode} className={styles.guestButton} disabled={loading}>
            Enter as Guest
          </button>
        </div>

        <div className={styles.footer}>
          <span>{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
          <button
            className={styles.toggleBtn}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Register Now" : "Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
