import { useState } from "react";
import { BookOpenIcon, XIcon } from "@/utils/icons";

interface GuideButtonProps {
  onClick: () => void;
  isOpen: boolean;
  currentPhase: number;
}

export function GuideButton({ onClick, isOpen, currentPhase }: GuideButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-6 right-6 z-50
        flex items-center gap-2
        px-4 py-3 rounded-full
        font-semibold text-sm
        transition-all duration-300
        shadow-lg hover:shadow-xl
        ${isOpen
          ? "bg-[#ef4444] text-white"
          : "bg-[#d39e17] text-[#12110d] hover:bg-[#f0c040]"
        }
      `}
      style={{
        boxShadow: isOpen
          ? "0 10px 25px -5px rgba(239, 68, 68, 0.4)"
          : "0 10px 25px -5px rgba(211, 158, 23, 0.4)",
      }}
    >
      {isOpen ? (
        <>
          <XIcon size="small" label="" />
          <span>Fechar</span>
        </>
      ) : (
        <>
          <BookOpenIcon size="small" label="" />
          <span>Guia</span>
          <span
            className="flex items-center justify-center w-6 h-6 rounded-full bg-[#12110d] text-[#d39e17] text-xs font-bold"
          >
            {currentPhase}
          </span>
        </>
      )}
    </button>
  );
}
