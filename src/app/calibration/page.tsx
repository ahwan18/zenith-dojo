import { redirect } from "next/navigation";

import { APP_ROUTES } from "@/constants/appConstants";

export default function LegacyCalibrationPage() {
  redirect(APP_ROUTES.playCalibrate);
}
