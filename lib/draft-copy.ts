export function draftDescription(input: {
  brand?: string;
  model?: string;
  year?: string;
  seat?: string;
  flap?: string;
  panel?: string;
  serial?: string;
  condition?: string;
}) {
  const title = [input.brand, input.model].map((part) => part?.trim()).filter(Boolean);
  const facts = [
    input.seat?.trim() ? `${input.seat.trim().replace(/"$/, "")}"` : "",
    input.flap?.trim(),
    input.panel?.trim(),
    input.year?.trim(),
  ].filter(Boolean);

  const head = [...title, ...facts].join(" · ");
  const tail = [
    input.serial?.trim() ? `Serial ${input.serial.trim()}` : "",
    input.condition?.trim(),
  ]
    .filter(Boolean)
    .join(" · ");

  if (!head && !tail) return "";
  if (!tail) return `${head}.`;
  if (!head) return `${tail}.`;
  return `${head}. ${tail}.`;
}
