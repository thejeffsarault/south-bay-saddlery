import type { Metadata } from "next";
import { PresentForm } from "@/components/PresentForm";

export const metadata: Metadata = {
  title: "Present Your Saddle",
};

export default function PresentPage() {
  return (
    <div className="space-y-6">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-sbs-muted">
        Intake
      </p>
      <h1 className="font-serif text-4xl text-sbs-text">Present Your Saddle</h1>
      <p className="text-sbs-ink">
        Mobile intake for a pre-owned English saddle. Jeff reviews every
        presentation in the founder queue before it can appear in the
        Collection.
      </p>
      <PresentForm />
    </div>
  );
}
