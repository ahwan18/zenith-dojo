export const APP_NAME = "Zenith: The Vision Master";
export const PUBLIC_APP_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://zenith-dojo.vercel.app";

export const APP_ROUTES = {
  home: "/",
  auth: "/auth",
  authCallback: "/auth/callback",
  menu: "/menu",
  chooseMode: "/choose-mode",
  playBody: "/play/body",
  playCalibrate: "/play/calibrate",
  playLoading: "/play/loading",
  playResults: "/play/results",
  settings: "/settings",
  leaderboard: "/leaderboard",
  profile: "/profile",
} as const;

export function buildPublicUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${PUBLIC_APP_URL}${normalizedPath}`;
}
