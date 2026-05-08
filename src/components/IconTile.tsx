import type { ReactNode } from "react";

interface IconTileProps {
  children: ReactNode;
  tone?: "red" | "amber" | "teal" | "green" | "blue" | "violet";
}

const toneClasses = {
  red: "bg-red-50 text-red-600",
  amber: "bg-amber-50 text-amber-600",
  teal: "bg-cyan-50 text-ai",
  green: "bg-green-50 text-green-600",
  blue: "bg-blue-50 text-blue-600",
  violet: "bg-violet-50 text-violet-600",
};

export function IconTile({ children, tone = "teal" }: IconTileProps) {
  return (
    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
      {children}
    </div>
  );
}
