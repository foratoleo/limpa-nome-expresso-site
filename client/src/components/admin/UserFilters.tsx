/**
 * UserFilters Component
 *
 * Multi-select filter controls for admin user list.
 * Supports filtering by status (active/expired/inactive) and access type (manual/paid/free).
 *
 * @example
 * ```tsx
 * const [statusFilters, setStatusFilters] = useState<StatusFilter[]>([]);
 * const [accessTypeFilters, setAccessTypeFilters] = useState<AccessTypeFilter[]>([]);
 *
 * <UserFilters
 *   statusFilters={statusFilters}
 *   onStatusChange={setStatusFilters}
 *   accessTypeFilters={accessTypeFilters}
 *   onAccessTypeChange={setAccessTypeFilters}
 * />
 * ```
 */

import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

/**
 * Status filter options
 */
export type StatusFilter = 'active' | 'expired' | 'inactive';

/**
 * Access type filter options
 */
export type AccessTypeFilter = 'manual' | 'paid' | 'free';

export interface UserFiltersProps {
  /** Currently selected status filters */
  statusFilters: StatusFilter[];
  /** Callback when status filters change */
  onStatusChange: (filters: StatusFilter[]) => void;
  /** Currently selected access type filters */
  accessTypeFilters: AccessTypeFilter[];
  /** Callback when access type filters change */
  onAccessTypeChange: (filters: AccessTypeFilter[]) => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Toggle a filter value in an array
 */
function toggleFilter<T>(filters: T[], value: T): T[] {
  if (filters.includes(value)) {
    return filters.filter(f => f !== value);
  } else {
    return [...filters, value];
  }
}

// ============================================================================
// Component
// ============================================================================

/**
 * Multi-select filter controls for admin user list.
 *
 * Features:
 * - Status filter: active, expired, inactive (multi-select)
 * - Access type filter: manual, paid, free (multi-select)
 * - Clear filters button when any filter is active
 * - Filter icon for visual clarity
 * - Checkbox controls for easy selection
 */
export function UserFilters({
  statusFilters,
  onStatusChange,
  accessTypeFilters,
  onAccessTypeChange,
}: UserFiltersProps) {
  /**
   * Handle status filter toggle
   */
  const handleStatusToggle = (status: StatusFilter) => {
    onStatusChange(toggleFilter(statusFilters, status));
  };

  /**
   * Handle access type filter toggle
   */
  const handleAccessTypeToggle = (type: AccessTypeFilter) => {
    onAccessTypeChange(toggleFilter(accessTypeFilters, type));
  };

  /**
   * Clear all filters
   */
  const handleClearFilters = () => {
    onStatusChange([]);
    onAccessTypeChange([]);
  };

  // Filter options
  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'active', label: 'Ativo' },
    { value: 'expired', label: 'Expirado' },
    { value: 'inactive', label: 'Inativo' },
  ];

  const accessTypeOptions: { value: AccessTypeFilter; label: string }[] = [
    { value: 'manual', label: 'Manual' },
    { value: 'paid', label: 'Pago' },
    { value: 'free', label: 'Grátis' },
  ];

  const hasActiveFilters = statusFilters.length > 0 || accessTypeFilters.length > 0;

  return (
    <div className="flex items-center gap-4">
      {/* Header with icon and label */}
      <div className="flex items-center gap-2">
        <Filter size={16} className="text-muted-foreground" />
        <Label className="text-sm">Filtros:</Label>
      </div>

      {/* Status Filter Dropdown */}
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <div
              key={option.value}
              className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded cursor-pointer"
              onClick={() => handleStatusToggle(option.value)}
            >
              <Checkbox
                checked={statusFilters.includes(option.value)}
                onChange={() => {}}
                label={option.label}
              />
            </div>
          ))}
        </SelectContent>
      </Select>

      {/* Access Type Filter Dropdown */}
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Tipo de Acesso" />
        </SelectTrigger>
        <SelectContent>
          {accessTypeOptions.map((option) => (
            <div
              key={option.value}
              className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded cursor-pointer"
              onClick={() => handleAccessTypeToggle(option.value)}
            >
              <Checkbox
                checked={accessTypeFilters.includes(option.value)}
                onChange={() => {}}
                label={option.label}
              />
            </div>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters Button (only shown when filters are active) */}
      {hasActiveFilters && (
        <button
          onClick={handleClearFilters}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          type="button"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Export Default
// ============================================================================

export default UserFilters;
