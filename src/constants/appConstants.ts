export const APP_NAME = "Zenith: The Vision Master";
export const PRODUCTION_APP_URL = "https://zenith-dojo.vercel.app";

function normalizeSiteUrl(siteUrl: string | undefined): string {
  const trimmedUrl = siteUrl?.trim();

  if (!trimmedUrl) {
    return PRODUCTION_APP_URL;
  }

  const withoutTrailingSlash = trimmedUrl.replace(/\/+$/, "");
  const isLocalUrl =
    withoutTrailingSlash.includes("localhost") || withoutTrailingSlash.includes("127.0.0.1");

  return isLocalUrl ? PRODUCTION_APP_URL : withoutTrailingSlash;
}

export const PUBLIC_APP_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

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
