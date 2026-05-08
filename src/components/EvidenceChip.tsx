interface EvidenceChipProps {
  label: string;
}

export function EvidenceChip({ label }: EvidenceChipProps) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
      {label}
    </span>
  );
}
