/**
 * RevokeConfirmDialog Component
 *
 * Confirmation dialog for destructive admin actions (revoking user access).
 * Uses Radix UI AlertDialog to prevent accidental access revocation.
 *
 * Features:
 * - Trigger button with UserX icon
 * - Warning message with user email
 * - "This action cannot be undone" warning
 * - Cancel and Confirm buttons
 * - Destructive styling for confirm button
 *
 * @example
 * ```tsx
 * <RevokeConfirmDialog
 *   userName="João Silva"
 *   userEmail="joao@example.com"
 *   onConfirm={async () => {
 *     await revokeAccess(userId);
 *     toast.success("Access revoked");
 *   }}
 * />
 * ```
 */

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { UserX } from "lucide-react";

// ============================================================================
// TypeScript Types
// ============================================================================

/**
 * Props for RevokeConfirmDialog component
 */
export interface RevokeConfirmDialogProps {
  /** Name of the user whose access will be revoked */
  userName: string;
  /** Email of the user (displayed in warning message) */
  userEmail: string;
  /** Async function to call when confirmed */
  onConfirm: () => Promise<void>;
}

// ============================================================================
// Component
// ============================================================================

/**
 * RevokeConfirmDialog displays a confirmation dialog before revoking user access.
 *
 * The dialog opens when the trigger button is clicked, shows a warning message
 * with the user's email, and requires explicit confirmation before executing
 * the destructive action.
 *
 * @param props - Component props
 * @returns JSX element
 */
export function RevokeConfirmDialog({
  userName,
  userEmail,
  onConfirm,
}: RevokeConfirmDialogProps) {
  const [open, setOpen] = useState(false);

  /**
   * Handle confirm action
   * Executes the onConfirm callback and closes the dialog on success
   */
  const handleConfirm = async () => {
    try {
      await onConfirm();
      setOpen(false);
    } catch (error) {
      // Error handling is delegated to the caller (typically via toast notification)
      // Dialog remains open on error so user can retry or cancel
      console.error("Error revoking access:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" title="Revogar acesso">
          <UserX size={16} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revogar acesso de {userName}?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. O usuário <strong>{userEmail}</strong> perderá acesso
            imediatamente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Revogar acesso
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ============================================================================
// Export Default
// ============================================================================

export default RevokeConfirmDialog;
