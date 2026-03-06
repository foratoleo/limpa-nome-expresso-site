/**
 * useFormFill Hook
 *
 * Custom hook for form state management with auto-save to localStorage.
 * Handles form initialization, pre-fill from user data, validation,
 * and progress tracking.
 *
 * @example
 * ```tsx
 * const { values, updateField, getProgress, isDirty } = useFormFill(
 *   schema,
 *   userEmail
 * );
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { FormSection, FormValues, FieldValueType } from '../types/form';
import { useDebounce } from './useDebounce';

interface UseFormFillOptions {
  /** localStorage key for persistence (default: 'form-fill-state') */
  storageKey?: string;
  /** Auto-save interval in milliseconds (default: 30000 = 30 seconds) */
  autoSaveInterval?: number;
  /** Enable/disable auto-save (default: true) */
  enableAutoSave?: boolean;
}

interface FormFillResult {
  /** Current form values */
  values: FormValues;
  /** Update a single field value */
  updateField: (fieldId: string, value: FieldValueType) => void;
  /** Reset form to initial state */
  reset: () => void;
  /** Get overall progress across all sections */
  getProgress: () => { completed: number; total: number; percentage: number };
  /** Get completion status for a specific section (0-1) */
  getSectionProgress: (sectionId: string) => number;
  /** Whether form has unsaved changes */
  isDirty: boolean;
  /** Validate all required fields */
  validate: () => { isValid: boolean; errors: Record<string, string> };
  /** Manually trigger save to localStorage */
  save: () => void;
  /** Clear all saved data from localStorage */
  clearSaved: () => void;
}

const DEFAULT_STORAGE_KEY = 'form-fill-state';
const DEFAULT_AUTO_SAVE_INTERVAL = 30000; // 30 seconds

/**
 * Hook for managing form state with auto-save and pre-fill
 */
export function useFormFill(
  schema: FormSection[],
  userEmail: string,
  options: UseFormFillOptions = {}
): FormFillResult {
  const {
    storageKey = DEFAULT_STORAGE_KEY,
    autoSaveInterval = DEFAULT_AUTO_SAVE_INTERVAL,
    enableAutoSave = true,
  } = options;

  // Extract all fields from schema for easier access
  const allFields = schema.flatMap(section => section.fields);
  const fieldMap = new Map(allFields.map(field => [field.id, field]));

  // Initialize form values from schema defaults
  const getInitialValues = useCallback((): FormValues => {
    const initialValues: FormValues = {};

    // First, try to load from localStorage
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const savedValues = JSON.parse(saved);
          // Validate that saved values match current schema
          const isValid = Object.keys(savedValues).every(key =>
            fieldMap.has(key)
          );
          if (isValid) {
            return savedValues;
          }
        }
      } catch (error) {
        console.warn('Failed to load saved form state:', error);
      }
    }

    // Initialize with default values
    allFields.forEach(field => {
      initialValues[field.id] = '';
    });

    // Pre-fill email field if available
    if (userEmail) {
      const emailField = allFields.find(
        f => f.preFillFrom === 'email' || f.id === 'email'
      );
      if (emailField) {
        initialValues[emailField.id] = userEmail;
      }
    }

    return initialValues;
  }, [schema, userEmail, storageKey, fieldMap]);

  // Form state
  const [values, setValues] = useState<FormValues>(getInitialValues);
  const [isDirty, setIsDirty] = useState(false);

  // Track if this is the initial mount
  const isInitialMount = useRef(true);

  // Debounced values for auto-save
  const debouncedValues = useDebounce(values, autoSaveInterval);

  // Save to localStorage
  const save = useCallback(() => {
    if (typeof window === 'undefined' || !enableAutoSave) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(values));
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to save form state:', error);
    }
  }, [values, storageKey, enableAutoSave]);

  // Auto-save when debounced values change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (isDirty) {
      save();
    }
  }, [debouncedValues, isDirty, save]);

  // Update a single field
  const updateField = useCallback((fieldId: string, value: FieldValueType) => {
    setValues(prev => ({
      ...prev,
      [fieldId]: value,
    }));
    setIsDirty(true);
  }, []);

  // Reset form to initial state
  const reset = useCallback(() => {
    const initialValues: FormValues = {};
    allFields.forEach(field => {
      initialValues[field.id] = '';
    });

    // Pre-fill email field again
    if (userEmail) {
      const emailField = allFields.find(
        f => f.preFillFrom === 'email' || f.id === 'email'
      );
      if (emailField) {
        initialValues[emailField.id] = userEmail;
      }
    }

    setValues(initialValues);
    setIsDirty(false);
  }, [allFields, userEmail]);

  // Calculate overall progress
  const getProgress = useCallback(() => {
    let totalRequired = 0;
    let completedRequired = 0;

    allFields.forEach(field => {
      if (field.required) {
        totalRequired++;
        const value = values[field.id];
        if (value && value.toString().trim() !== '') {
          completedRequired++;
        }
      }
    });

    const percentage = totalRequired > 0
      ? Math.round((completedRequired / totalRequired) * 100)
      : 0;

    return {
      completed: completedRequired,
      total: totalRequired,
      percentage,
    };
  }, [values, allFields]);

  // Calculate section progress
  const getSectionProgress = useCallback((sectionId: string): number => {
    const section = schema.find(s => s.id === sectionId);
    if (!section) return 0;

    const requiredFields = section.fields.filter(f => f.required);
    if (requiredFields.length === 0) return 1;

    const completedCount = requiredFields.filter(field => {
      const value = values[field.id];
      return value && value.toString().trim() !== '';
    }).length;

    return completedCount / requiredFields.length;
  }, [schema, values]);

  // Validate all required fields
  const validate = useCallback(() => {
    const errors: Record<string, string> = {};

    allFields.forEach(field => {
      const value = values[field.id];

      // Check required fields
      if (field.required && (!value || value.toString().trim() === '')) {
        errors[field.id] = `${field.label} é obrigatório`;
        return;
      }

      // Skip validation if field is empty and not required
      if (!value || value.toString().trim() === '') return;

      // Run validation if present
      if (field.validation) {
        let isValid = true;

        if (field.validation.pattern) {
          isValid = field.validation.pattern.test(value.toString());
        } else if (field.validation.custom) {
          isValid = field.validation.custom(value.toString());
        }

        if (!isValid) {
          errors[field.id] = field.validation.errorMessage;
        }
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [values, allFields]);

  // Clear saved data from localStorage
  const clearSaved = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Failed to clear saved form state:', error);
    }
  }, [storageKey]);

  return {
    values,
    updateField,
    reset,
    getProgress,
    getSectionProgress,
    isDirty,
    validate,
    save,
    clearSaved,
  };
}

export default useFormFill;
