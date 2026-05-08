import { ChevronRight } from "lucide-react";

interface CauseChainProps {
  steps: string[];
}

export function CauseChain({ steps }: CauseChainProps) {
  return (
    <div className="flex flex-wrap items-stretch gap-2 xl:flex-nowrap">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={[
              "flex min-h-24 w-24 items-center justify-center rounded-2xl border px-2 text-center text-xs font-bold leading-snug shadow-sm",
              index === 0
                ? "border-red-100 bg-red-50 text-red-700"
                : index === steps.length - 1
                  ? "border-cyan-100 bg-cyan-50 text-ai"
                  : "border-amber-100 bg-amber-50 text-amber-800",
            ].join(" ")}
          >
            {step}
          </div>
          {index < steps.length - 1 ? <ChevronRight className="h-5 w-5 text-slate-400" /> : null}
        </div>
      ))}
    </div>
  );
}
