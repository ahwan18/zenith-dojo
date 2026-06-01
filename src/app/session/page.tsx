import { redirect } from "next/navigation";

import { APP_ROUTES } from "@/constants/appConstants";

export default function LegacySessionPage() {
  redirect(APP_ROUTES.playResults);
}
