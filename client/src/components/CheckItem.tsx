/**
 * CheckItem Component - Figma Design
 *
 * A checklist item component with custom checkbox styling
 * matching the Figma design with gold accents.
 */
import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";

export interface CheckItemData {
  id: string;
  label: string;
  detail?: string;
}

export interface CheckItemProps {
  item: CheckItemData;
  checked: boolean;
  onToggle: (id: string) => void;
  className?: string;
  testId?: string;
}

export function CheckItem({
  item,
  checked,
  onToggle,
  className = "",
  testId,
}: CheckItemProps) {
  const handleClick = React.useCallback(() => {
    onToggle(item.id);
  }, [item.id, onToggle]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        onToggle(item.id);
      }
    },
    [item.id, onToggle]
  );

  return (
    <li className={className} data-testid={testId}>
      <button
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className="w-full flex items-start gap-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d39e17] focus-visible:ring-offset-2 focus-visible:ring-offset-[#162847] rounded-lg"
        style={{
          padding: "8px 0",
        }}
        aria-pressed={checked}
        aria-label={`${checked ? "Marcar como não concluído" : "Marcar como concluído"}: ${item.label}`}
      >
        {/* Custom checkbox - Figma style */}
        <span
          className="flex-shrink-0 flex items-center justify-center rounded-lg transition-all duration-200"
          style={{
            width: 20,
            height: 20,
            marginTop: 2,
            backgroundColor: checked ? "#22c55e" : "rgba(255, 255, 255, 0.05)",
            border: checked ? "2px solid #22c55e" : "1px solid rgba(211, 158, 23, 0.5)",
          }}
          aria-hidden="true"
        >
          {checked && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                fill="#12110d"
              />
            </svg>
          )}
        </span>

        {/* Label and detail */}
        <span className="flex-1 min-w-0">
          <span
            className="block font-medium leading-snug"
            style={{
              color: checked ? "#e8e4d8" : "#e8e4d8",
              fontSize: 16,
              textDecoration: checked ? "line-through" : "none",
              opacity: checked ? 0.6 : 1,
              fontFamily: "'Public Sans', sans-serif",
            }}
          >
            {item.label}
          </span>
          {item.detail && (
            <span
              className="block mt-0.5 leading-relaxed"
              style={{
                color: "#94a3b8",
                fontSize: 12,
                fontFamily: "'Public Sans', sans-serif",
              }}
            >
              {item.detail}
            </span>
          )}
        </span>

        {/* Hidden checkbox for form integration */}
        <span className="sr-only">
          <Checkbox
            checked={checked}
            onCheckedChange={() => onToggle(item.id)}
            aria-label={item.label}
            tabIndex={-1}
          />
        </span>
      </button>
    </li>
  );
}

export interface CheckItemListProps {
  items: CheckItemData[];
  checked: Record<string, boolean>;
  onToggle: (id: string) => void;
  className?: string;
  testIdPrefix?: string;
}

export function CheckItemList({
  items,
  checked,
  onToggle,
  className = "",
  testIdPrefix = "check-item",
}: CheckItemListProps) {
  return (
    <ul
      className={`space-y-0 ${className}`}
      role="list"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "8px 32px",
      }}
    >
      {items.map((item) => (
        <CheckItem
          key={item.id}
          item={item}
          checked={!!checked[item.id]}
          onToggle={onToggle}
          testId={`${testIdPrefix}-${item.id}`}
        />
      ))}
    </ul>
  );
}

export default CheckItem;
