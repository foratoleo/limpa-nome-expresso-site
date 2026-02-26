/**
 * Checkbox Component - Atlassian Design System Migration
 *
 * This component wraps @atlaskit/checkbox with backward-compatible API
 * to maintain compatibility with existing codebase using Radix UI patterns.
 *
 * Migration Notes:
 * - Uses @atlaskit/checkbox internally for consistent Atlassian styling
 * - Maintains compatibility with React Hook Form and form libraries
 * - Provides proper accessibility with ARIA attributes
 * - Supports controlled and uncontrolled usage patterns
 *
 * @see https://atlassian.design/components/checkbox
 */
import * as React from "react";
import CheckboxPrimitive, {
  type CheckboxProps as AtlaskitCheckboxProps,
} from "@atlaskit/checkbox";

/**
 * Checkbox component props
 * Extends Atlaskit CheckboxProps with additional backward-compatible props
 */
export interface CheckboxProps
  extends Omit<
    AtlaskitCheckboxProps,
    "onChange" | "isChecked" | "isDisabled" | "name"
  > {
  /** Whether the checkbox is checked */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Form field name */
  name?: string;
  /** Value for form submission */
  value?: string | number;
  /** Required field indicator */
  required?: boolean;
  /** Change handler */
  onCheckedChange?: (checked: boolean) => void;
  /** Legacy change handler for backward compatibility */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Additional CSS class names */
  className?: string;
  /** Accessible label for screen readers */
  "aria-label"?: string;
  /** ID of element that labels this checkbox */
  "aria-labelledby"?: string;
  /** ID of element that describes this checkbox */
  "aria-describedby"?: string;
}

/**
 * Checkbox component wrapping @atlaskit/checkbox
 *
 * Provides a backward-compatible API while using Atlassian Design System
 * styling and accessibility features internally.
 *
 * @example
 * ```tsx
 * // Controlled usage
 * <Checkbox
 *   checked={isChecked}
 *   onCheckedChange={setChecked}
 *   label="Accept terms"
 * />
 *
 * // Uncontrolled usage
 * <Checkbox
 *   defaultChecked={false}
 *   name="newsletter"
 *   label="Subscribe to newsletter"
 * />
 *
 * // With React Hook Form
 * <Checkbox
 *   {...field}
 *   checked={field.value}
 *   onCheckedChange={field.onChange}
 *   label="Remember me"
 * />
 * ```
 */
function Checkbox({
  checked,
  defaultChecked,
  disabled = false,
  name,
  value,
  required = false,
  onCheckedChange,
  onChange,
  className,
  label,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  "aria-describedby": ariaDescribedby,
  ...rest
}: CheckboxProps) {
  // Handle controlled vs uncontrolled state
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = React.useState(
    defaultChecked ?? false
  );

  const isChecked = isControlled ? checked : internalChecked;

  // Handle change events
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = event.target.checked;

      // Update internal state if uncontrolled
      if (!isControlled) {
        setInternalChecked(newChecked);
      }

      // Call legacy onChange handler
      if (onChange) {
        onChange(event);
      }

      // Call new onCheckedChange handler
      if (onCheckedChange) {
        onCheckedChange(newChecked);
      }
    },
    [isControlled, onChange, onCheckedChange]
  );

  return (
    <div
      className={className}
      data-slot="checkbox-wrapper"
      role="presentation"
    >
      <CheckboxPrimitive
        {...rest}
        label={label}
        isChecked={isChecked}
        isDisabled={disabled}
        name={name}
        value={value}
        onChange={handleChange}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        // Pass required as data attribute for form validation
        {...(required && { "aria-required": true })}
      />
    </div>
  );
}

/**
 * Checkbox indicator component for custom checkbox styling
 * This is a compatibility shim - @atlaskit/checkbox handles indicator internally
 */
function CheckboxIndicator({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={className}
      data-slot="checkbox-indicator"
      role="presentation"
    >
      {children}
    </span>
  );
}

export { Checkbox, CheckboxIndicator };
export default Checkbox;
