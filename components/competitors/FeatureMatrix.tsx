import type { Competitor } from "@/lib/schemas/competitor";

interface Props {
  competitors: Competitor[];
}

export default function FeatureMatrix({ competitors }: Props) {
  if (!competitors || competitors.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
        No competitor data available.
      </div>
    );
  }

  // Collect all unique features across competitors
  const allFeatures = Array.from(
    new Set(competitors.flatMap((c) => c.features))
  ).slice(0, 15); // cap at 15 rows for readability

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 bg-background border border-border px-3 py-2 text-left font-semibold text-muted-foreground">
              Feature
            </th>
            {competitors.map((c) => (
              <th
                key={c.name}
                className="border border-border px-3 py-2 text-center font-semibold max-w-[100px]"
              >
                {c.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allFeatures.map((feature) => (
            <tr key={feature} className="even:bg-muted/30">
              <td className="sticky left-0 bg-background border border-border px-3 py-1.5 text-muted-foreground">
                {feature}
              </td>
              {competitors.map((c) => (
                <td
                  key={c.name}
                  className="border border-border px-3 py-1.5 text-center"
                >
                  {c.features.includes(feature) ? (
                    <span className="text-green-600 font-bold">✓</span>
                  ) : (
                    <span className="text-zinc-300">—</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
