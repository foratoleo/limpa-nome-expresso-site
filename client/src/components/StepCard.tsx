import { useState } from "react";
import { ChevronDownIcon } from "@/utils/icons";
import { TipBanner } from "@/components/TipBanner";
import { LinkButton } from "@/components/ui/LinkButton";
import { DownloadButton } from "@/components/ui/DownloadButton";
import { StepProgressBar } from "@/components/ProgressBar";
import {
  CheckItemList,
  type CheckItemData,
} from "@/components/CheckItem";

// Re-export CheckItemData as CheckItem for backward compatibility
export type CheckItem = CheckItemData;

export interface Step {
  number: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  items: CheckItem[];
  tip?: string;
  links?: { label: string; url: string; external?: boolean }[];
  downloads?: { label: string; file: string; description: string }[];
}

interface StepCardProps {
  step: Step;
  checked: Record<string, boolean>;
  onToggle: (id: string) => void;
}

export function StepCard({ step, checked, onToggle }: StepCardProps) {
  const [open, setOpen] = useState(true);
  const stepChecked = step.items.filter((i) => checked[i.id]).length;
  const stepDone = stepChecked === step.items.length;

  return (
    <div
      className={`relative rounded-3xl border transition-all duration-300 backdrop-blur-[4px] overflow-hidden ${
        stepDone ? "shadow-lg" : ""
      }`}
      style={{
        backgroundColor: "rgba(22, 40, 71, 0.95)",
        borderColor: stepDone ? "rgba(34, 197, 94, 0.4)" : "rgba(211, 158, 23, 0.2)",
        boxShadow: stepDone
          ? "0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.1)"
          : "0px 25px 50px -12px rgba(0, 0, 0, 0.25)",
      }}
    >
      {/* Success indicator bar at top */}
      {stepDone && (
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: "rgba(34, 197, 94, 0.2)" }}
        >
          <div className="absolute inset-0" style={{ backgroundColor: "#22c55e" }} />
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-5 px-6 pt-6 pb-4 text-left"
      >
        {/* Step number circle */}
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-full border-2 transition-all"
          style={{
            width: open ? 56 : 40,
            height: open ? 56 : 40,
            borderColor: stepDone ? "#22c55e" : step.color,
            backgroundColor: stepDone ? "rgba(34, 197, 94, 0.2)" : (open ? `${step.color}20` : "transparent"),
          }}
        >
          {stepDone ? (
            <svg width="22" height="17" viewBox="0 0 22 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 8.5L8 14.5L20 2.5" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <span
              className="font-bold"
              style={{
                color: step.color,
                fontSize: open ? 24 : 18,
              }}
            >
              {step.number}
            </span>
          )}
        </div>

        {/* Title and subtitle */}
        <div className="flex-1 min-w-0">
          <h3
            className="font-bold leading-tight transition-all"
            style={{
              color: stepDone ? "rgba(232, 228, 216, 0.6)" : "#e8e4d8",
              fontSize: open ? 20 : 16,
              textDecoration: stepDone ? "line-through" : "none",
            }}
          >
            {step.title}
          </h3>
          <p
            className="text-sm mt-1"
            style={{ color: stepDone ? "#22c55e" : "rgba(147, 197, 253, 0.8)" }}
          >
            {stepDone ? `Etapa concluída` : step.subtitle}
          </p>
        </div>

        {/* Progress and chevron */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span
            className="text-sm font-medium"
            style={{ color: "#94a3b8" }}
          >
            {stepChecked}/{step.items.length}
          </span>
          <span style={{ color: "#94a3b8" }} className="transition-transform duration-200 inline-flex">
            <ChevronDownIcon size="small" label="" />
          </span>
        </div>
      </button>

      {/* Progress bar */}
      <div className="mx-6 mb-2">
        <StepProgressBar progress={(stepChecked / step.items.length) * 100} color={stepDone ? "#22c55e" : step.color} />
      </div>

      {/* Expandable content */}
      {open && (
        <div className="px-6 pt-3 pb-6 space-y-4">
          {/* Tip */}
          {step.tip && <TipBanner>{step.tip}</TipBanner>}

          {/* Downloads */}
          {step.downloads && step.downloads.length > 0 && (
            <div className="space-y-2">
              {step.downloads.map((d) => (
                <DownloadButton
                  key={d.file}
                  label={d.label}
                  file={d.file}
                  description={d.description}
                  variant="primary"
                />
              ))}
            </div>
          )}

          {/* Links */}
          {step.links && step.links.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {step.links.map((l) => (
                <LinkButton key={l.url} label={l.label} url={l.url} variant="default" />
              ))}
            </div>
          )}

          {/* Checklist */}
          <CheckItemList
            items={step.items}
            checked={checked}
            onToggle={onToggle}
            testIdPrefix={`step-${step.number}-item`}
          />
        </div>
      )}
    </div>
  );
}

export default StepCard;
