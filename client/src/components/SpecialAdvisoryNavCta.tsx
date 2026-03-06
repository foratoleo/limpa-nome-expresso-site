interface SpecialAdvisoryNavCtaProps {
  active?: boolean;
  shortLabel?: boolean;
}

export function SpecialAdvisoryNavCta({ active = false, shortLabel = false }: SpecialAdvisoryNavCtaProps) {
  return (
    <a
      href="/assessoria-especializada"
      className="inline-flex items-center justify-center h-7 px-3 rounded-full text-[10px] font-semibold uppercase tracking-[0.08em] leading-none whitespace-nowrap border transition-all hover:-translate-y-[1px]"
      style={
        active
          ? {
              color: "#12110d",
              background: "linear-gradient(135deg, #fde68a 0%, #d39e17 55%, #f59e0b 100%)",
              borderColor: "rgba(254, 243, 199, 0.85)",
              boxShadow: "0 6px 18px rgba(211, 158, 23, 0.3)",
            }
          : {
              color: "#fef3c7",
              backgroundColor: "rgba(211, 158, 23, 0.12)",
              borderColor: "rgba(211, 158, 23, 0.45)",
            }
      }
    >
      {shortLabel ? "Assessoria" : "Assessoria Plus"}
    </a>
  );
}
