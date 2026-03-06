import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import * as React from "react";

export interface FormInputProps
  extends Omit<React.ComponentProps<"input">, "size"> {
  label?: string;
  error?: string;
  description?: string;
  inputType?: "text" | "number" | "currency" | "date" | "textarea";
  required?: boolean;
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      description,
      inputType = "text",
      required = false,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();
    const errorId = `${inputId}-error`;
    const descriptionId = `${inputId}-description`;

    // Currency formatting
    const formatCurrency = (value: string) => {
      const numbers = value.replace(/\D/g, "");
      return (Number(numbers) / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (inputType === "currency") {
        const value = (e.target as HTMLInputElement | HTMLTextAreaElement).value;
        (e.target as HTMLInputElement | HTMLTextAreaElement).value = value.replace(/\D/g, "");
      }
      props.onChange?.(e as React.ChangeEvent<HTMLInputElement>);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (inputType === "currency" && (e.target as HTMLInputElement | HTMLTextAreaElement).value) {
        const numbers = (e.target as HTMLInputElement | HTMLTextAreaElement).value.replace(/\D/g, "");
        const formatted = formatCurrency(numbers);
        (e.target as HTMLInputElement | HTMLTextAreaElement).value = formatted;
      }
      props.onBlur?.(e as React.FocusEvent<HTMLInputElement>);
    };

    const baseInputClassName = cn(
      "dark:bg-input/30 border-input",
      "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
      "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
      error && "border-destructive",
      className
    );

    const inputElement = inputType === "textarea" ? (
      <Textarea
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={`${error ? errorId : ""} ${description ? descriptionId : ""}`.trim() || undefined}
        className={baseInputClassName}
        onChange={handleChange}
        onBlur={handleBlur}
        {...(props as React.ComponentProps<typeof Textarea>)}
      />
    ) : (
      <Input
        ref={ref}
        id={inputId}
        type={inputType === "currency" ? "text" : inputType}
        aria-invalid={!!error}
        aria-describedby={`${error ? errorId : ""} ${description ? descriptionId : ""}`.trim() || undefined}
        className={baseInputClassName}
        onChange={handleChange}
        onBlur={handleBlur}
        {...props}
      />
    );

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <Label
            htmlFor={inputId}
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              error && "text-destructive"
            )}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        {inputElement}
        {description && !error && (
          <p id={descriptionId} className="text-muted-foreground text-xs">
            {description}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-destructive text-xs" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";

export { FormInput };
