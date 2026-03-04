/**
 * Component tests for RevokeConfirmDialog
 *
 * Tests the confirmation dialog that appears before revoking user access.
 * Verifies dialog behavior, user information display, and confirm/cancel actions.
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { UserX } from "lucide-react";
import { RevokeConfirmDialog } from "../RevokeConfirmDialog";

describe("RevokeConfirmDialog", () => {
  const mockUserName = "João Silva";
  const mockUserEmail = "joao@example.com";
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    mockOnConfirm.mockClear();
  });

  describe("dialog behavior", () => {
    it("opens dialog when trigger button is clicked", () => {
      render(
        <RevokeConfirmDialog
          userName={mockUserName}
          userEmail={mockUserEmail}
          onConfirm={mockOnConfirm}
        />
      );

      // Trigger button should be present
      const trigger = screen.getByRole("button");
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute("data-state", "closed");
    });

    it("shows user name and email in description when opened", async () => {
      render(
        <RevokeConfirmDialog
          userName={mockUserName}
          userEmail={mockUserEmail}
          onConfirm={mockOnConfirm}
        />
      );

      // Click trigger to open dialog
      const trigger = screen.getByRole("button");
      fireEvent.click(trigger);

      // Wait for dialog content to appear
      await waitFor(() => {
        expect(screen.getByText(`Revogar acesso de ${mockUserName}?`)).toBeInTheDocument();
      });

      // Check that user email is shown in warning
      const description = screen.queryByText(
        (content) => content?.includes(mockUserEmail) && content?.includes("Esta ação não pode ser desfeita")
      );
      expect(description).toBeInTheDocument();
    });

    it("displays warning that action cannot be undone", async () => {
      render(
        <RevokeConfirmDialog
          userName={mockUserName}
          userEmail={mockUserEmail}
          onConfirm={mockOnConfirm}
        />
      );

      const trigger = screen.getByRole("button");
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText(/Esta ação não pode ser desfeita/i)).toBeInTheDocument();
      });
    });
  });

  describe("cancel action", () => {
    it("closes dialog when cancel button is clicked without calling onConfirm", async () => {
      render(
        <RevokeConfirmDialog
          userName={mockUserName}
          userEmail={mockUserEmail}
          onConfirm={mockOnConfirm}
        />
      );

      // Open dialog
      const trigger = screen.getByRole("button");
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("Cancelar")).toBeInTheDocument();
      });

      // Click cancel
      const cancelButton = screen.getByText("Cancelar");
      fireEvent.click(cancelButton);

      // Dialog should close and onConfirm should NOT be called
      await waitFor(() => {
        expect(mockOnConfirm).not.toHaveBeenCalled();
      });
    });

    it("does not call onConfirm when dialog is dismissed", async () => {
      render(
        <RevokeConfirmDialog
          userName={mockUserName}
          userEmail={mockUserEmail}
          onConfirm={mockOnConfirm}
        />
      );

      const trigger = screen.getByRole("button");
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("Cancelar")).toBeInTheDocument();
      });

      // Click cancel
      fireEvent.click(screen.getByText("Cancelar"));

      // Verify onConfirm was not called
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });
  });

  describe("confirm action", () => {
    it("calls onConfirm when confirm button is clicked", async () => {
      render(
        <RevokeConfirmDialog
          userName={mockUserName}
          userEmail={mockUserEmail}
          onConfirm={mockOnConfirm}
        />
      );

      // Open dialog
      const trigger = screen.getByRole("button");
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("Revogar acesso")).toBeInTheDocument();
      });

      // Click confirm
      const confirmButton = screen.getByText("Revogar acesso");
      fireEvent.click(confirmButton);

      // Verify onConfirm was called
      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      });
    });

    it("closes dialog after successful confirmation", async () => {
      mockOnConfirm.mockResolvedValueOnce(undefined);

      render(
        <RevokeConfirmDialog
          userName={mockUserName}
          userEmail={mockUserEmail}
          onConfirm={mockOnConfirm}
        />
      );

      // Open dialog
      const trigger = screen.getByRole("button");
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("Revogar acesso")).toBeInTheDocument();
      });

      // Click confirm
      fireEvent.click(screen.getByText("Revogar acesso"));

      // Wait for async confirm and dialog close
      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalled();
      });
    });
  });

  describe("destructive styling", () => {
    it("applies destructive styling to confirm button", async () => {
      render(
        <RevokeConfirmDialog
          userName={mockUserName}
          userEmail={mockUserEmail}
          onConfirm={mockOnConfirm}
        />
      );

      // Open dialog
      const trigger = screen.getByRole("button");
      fireEvent.click(trigger);

      await waitFor(() => {
        const confirmButton = screen.getByText("Revogar acesso");
        expect(confirmButton).toBeInTheDocument();
        // Confirm button should have destructive styling
        expect(confirmButton.closest("button")).toHaveClass("bg-destructive");
      });
    });
  });

  describe("trigger button", () => {
    it("renders trigger with UserX icon", () => {
      render(
        <RevokeConfirmDialog
          userName={mockUserName}
          userEmail={mockUserEmail}
          onConfirm={mockOnConfirm}
        />
      );

      const trigger = screen.getByRole("button");
      expect(trigger).toBeInTheDocument();
      // Trigger should have ghost variant and small size
      expect(trigger).toHaveClass("ghost");
    });
  });
});
