import { formatUsdPrecise } from "@/lib/catalog";
import { SELLER_PAYOUT_COPY, WORKED_EXAMPLE } from "@/lib/payout";

function Example() {
  return (
    <p className="text-xs text-sbs-muted">
      Worked example {formatUsdPrecise(WORKED_EXAMPLE.list)}: Stripe ≈{" "}
      {formatUsdPrecise(WORKED_EXAMPLE.stripeProcessing)}, SBS 12% ={" "}
      {formatUsdPrecise(WORKED_EXAMPLE.sbsFee)}, seller net ≈{" "}
      {formatUsdPrecise(WORKED_EXAMPLE.sellerNet)}.
    </p>
  );
}

export function SellerTerms({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-sbs-muted">
        Seller payout
      </p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-sbs-ink">
        {SELLER_PAYOUT_COPY.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <Example />
    </div>
  );
}
