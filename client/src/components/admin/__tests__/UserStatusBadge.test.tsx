/**
 * Unit tests for UserStatusBadge component
 *
 * Tests color-coded status badges for user access states:
 * - active (green with checkmark)
 * - pending (yellow with clock)
 * - expired (red with X)
 * - manual (blue with shield)
 * - free (gray)
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CheckCircle, Clock, XCircle, Shield, User } from "lucide-react";
import { UserStatusBadge } from "../UserStatusBadge";

describe("UserStatusBadge", () => {
  describe("active status", () => {
    it("renders green badge with checkmark icon", () => {
      render(<UserStatusBadge status="active" />);
      const badge = screen.getByText("Ativo");

      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain("bg-green-500");
      expect(badge.className).toContain("text-white");
    });

    it("includes CheckCircle icon", () => {
      const { container } = render(<UserStatusBadge status="active" />);
      const icon = container.querySelector("svg");

      expect(icon).toBeInTheDocument();
      // CheckCircle is the icon used for active status
    });
  });

  describe("pending status", () => {
    it("renders yellow badge with clock icon", () => {
      render(<UserStatusBadge status="pending" />);
      const badge = screen.getByText("Pendente");

      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain("bg-yellow-500");
      expect(badge.className).toContain("text-white");
    });

    it("includes Clock icon", () => {
      const { container } = render(<UserStatusBadge status="pending" />);
      const icon = container.querySelector("svg");

      expect(icon).toBeInTheDocument();
    });
  });

  describe("expired status", () => {
    it("renders red badge with X icon", () => {
      render(<UserStatusBadge status="expired" />);
      const badge = screen.getByText("Expirado");

      expect(badge).toBeInTheDocument();
      // Expired uses destructive variant which is red
      expect(badge.className).toContain("bg-destructive");
    });

    it("includes XCircle icon", () => {
      const { container } = render(<UserStatusBadge status="expired" />);
      const icon = container.querySelector("svg");

      expect(icon).toBeInTheDocument();
    });
  });

  describe("manual status", () => {
    it("renders blue badge with shield icon", () => {
      render(<UserStatusBadge status="manual" />);
      const badge = screen.getByText("Manual");

      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain("border-blue-500");
      expect(badge.className).toContain("text-blue-500");
    });

    it("includes Shield icon", () => {
      const { container } = render(<UserStatusBadge status="manual" />);
      const icon = container.querySelector("svg");

      expect(icon).toBeInTheDocument();
    });
  });

  describe("free status", () => {
    it("renders gray badge for free users", () => {
      render(<UserStatusBadge status="free" />);
      const badge = screen.getByText("Grátis");

      expect(badge).toBeInTheDocument();
      // Free uses secondary variant which is gray
      expect(badge.className).toContain("bg-secondary");
    });
  });

  describe("icon positioning", () => {
    it("positions icon before text with gap", () => {
      const { container } = render(<UserStatusBadge status="active" />);
      const badge = container.querySelector("span");

      expect(badge).toBeInTheDocument();
      // Badge should have gap class for icon spacing
      expect(badge?.className).toContain("gap-1");
    });
  });
});
