/**
 * ProgressBar Components - Figma Design
 *
 * Progress bar components matching the Figma design with gold accents.
 */

interface GlobalProgressBarProps {
  progress: number;
  trackColor?: string;
  fillColor?: string;
}

export function GlobalProgressBar({
  progress,
  trackColor = "rgba(18, 17, 13, 0.8)",
  fillColor = "#d39e17",
}: GlobalProgressBarProps) {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-1"
      style={{ backgroundColor: trackColor }}
    >
      <div
        className="h-full transition-all duration-500"
        style={{
          width: `${progress}%`,
          backgroundColor: fillColor,
          boxShadow: "0 0 10px rgba(211, 158, 23, 0.5)",
        }}
      />
    </div>
  );
}

interface StepProgressBarProps {
  progress: number;
  color?: string;
  trackColor?: string;
}

export function StepProgressBar({
  progress,
  color = "#d39e17",
  trackColor = "rgba(211, 158, 23, 0.2)",
}: StepProgressBarProps) {
  return (
    <div
      className="h-1 rounded-full overflow-hidden"
      style={{ backgroundColor: trackColor }}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${progress}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}

interface StickyProgressBarProps {
  progress: number;
  trackColor?: string;
  gradientStart?: string;
  gradientEnd?: string;
}

export function StickyProgressBar({
  progress,
  trackColor = "rgba(18, 17, 13, 0.5)",
  gradientStart = "#d39e17",
  gradientEnd = "#f0c040",
}: StickyProgressBarProps) {
  return (
    <div
      className="h-2 rounded-full overflow-hidden"
      style={{ backgroundColor: trackColor }}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${progress}%`,
          background: `linear-gradient(to right, ${gradientStart}, ${gradientEnd})`,
          boxShadow: "0 0 10px rgba(211, 158, 23, 0.4)",
        }}
      />
    </div>
  );
}

export default GlobalProgressBar;
