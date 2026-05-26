import Link from "next/link";

import styles from "./not-found.module.css";

import { ZenithShell } from "@/shared/components/ZenithShell/ZenithShell";
import { ActionRow } from "@/shared/components/ActionRow/ActionRow";
import { Button } from "@/shared/components/Button/Button";
import { Card } from "@/shared/components/Card/Card";

export default function NotFoundPage() {
  return (
    <ZenithShell>
      <main className={styles.centerMain}>
        <div className={styles.centerInner}>
          <Card title="Page not found" subtitle="This route is not available">
            <p>The URL may be wrong, or this screen has not been built yet.</p>
            <ActionRow>
              <Button asChild variant="primary">
                <Link href="/">Back to home</Link>
              </Button>
            </ActionRow>
            <p>
              If the app was blank after an upgrade, stop the dev server, run{" "}
              <code className={styles.inlineCode}>pnpm dev:clean</code>, then hard-refresh with cache disabled.
            </p>
          </Card>
        </div>
      </main>
    </ZenithShell>
  );
}
