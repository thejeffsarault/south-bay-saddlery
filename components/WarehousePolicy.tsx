import { WAREHOUSE_POLICY } from "@/lib/commerce";

export function WarehousePolicy({
  tone = "details",
}: {
  tone?: keyof typeof WAREHOUSE_POLICY;
}) {
  return <p className="text-sm text-sbs-ink">{WAREHOUSE_POLICY[tone]}</p>;
}
