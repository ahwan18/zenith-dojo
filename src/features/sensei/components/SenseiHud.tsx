// "use client";

// import type { ReactElement } from "react";
// import { useMemo, useState } from "react";
// import { useMutation } from "@tanstack/react-query";

// import { Card } from "@/shared/components/Card/Card";
// import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
// import { ErrorState } from "@/shared/components/ErrorState/ErrorState";
// import { Spinner } from "@/shared/components/Spinner/Spinner";
// import { Button } from "@/shared/components/Button/Button";
// import { ActionRow } from "@/shared/components/ActionRow/ActionRow";
// import { analyzeSenseiFeedbackOnce } from "@/features/sensei";
// import type { SenseiAnalyzeRequest } from "@/features/sensei";

// export function SenseiHud(): ReactElement {
//   const [feedback, setFeedback] = useState<string | null>(null);

//   const requestPayload: SenseiAnalyzeRequest = useMemo(
//     () => ({
//       landmarkSummary: {
//         timestampMs: Date.now(),
//         landmarks: [],
//       },
//     }),
//     []
//   );

//   const analyzeMutation = useMutation({
//     mutationFn: async () => analyzeSenseiFeedbackOnce(requestPayload),
//     onSuccess: (result) => {
//       setFeedback(result.feedbackText);
//     },
//   });

//   const handleAnalyzeClick = () => {
//     setFeedback(null);
//     analyzeMutation.mutate();
//   };

//   return (
//     <Card title="AI Insights" subtitle="Sensei feedback">
//       <ActionRow>
//         <Button variant="primary" onClick={handleAnalyzeClick} disabled={analyzeMutation.isPending}>
//           Get Sensei Feedback (Mock Stream)
//         </Button>
//       </ActionRow>

//       {analyzeMutation.isPending ? <Spinner label="Analyzing…" /> : null}

//       {analyzeMutation.error ? (
//         <ErrorState
//           title="Sensei unavailable"
//           message="Please try again."
//           onRetry={() => analyzeMutation.mutate()}
//         />
//       ) : null}

//       {!analyzeMutation.isPending && !analyzeMutation.error && !feedback ? (
//         <EmptyState title="No feedback yet" message="Trigger a mock Sensei analysis to see output." />
//       ) : null}

//       {feedback ? <p>{feedback}</p> : null}
//     </Card>
//   );
// }

