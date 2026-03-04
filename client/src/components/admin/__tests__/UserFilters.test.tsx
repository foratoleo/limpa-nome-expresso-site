/**
 * UserFilters Component Tests
 *
 * Tests for filter controls component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserFilters } from '../UserFilters';

describe('UserFilters', () => {
  const mockProps = {
    statusFilters: [],
    onStatusChange: vi.fn(),
    accessTypeFilters: [],
    onAccessTypeChange: vi.fn(),
  };

  it('should render filter dropdowns', () => {
    render(<UserFilters {...mockProps} />);

    expect(screen.getByText('Filtros:')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Tipo de Acesso')).toBeInTheDocument();
  });

  it('should toggle status filter', () => {
    render(<UserFilters {...mockProps} />);

    const statusDropdown = screen.getByText('Status');
    fireEvent.click(statusDropdown);

    const activeCheckbox = screen.getByText('Ativo');
    fireEvent.click(activeCheckbox);

    expect(mockProps.onStatusChange).toHaveBeenCalledWith(['active']);
  });

  it('should toggle access type filter', () => {
    render(<UserFilters {...mockProps} />);

    const accessTypeDropdown = screen.getByText('Tipo de Acesso');
    fireEvent.click(accessTypeDropdown);

    const manualCheckbox = screen.getByText('Manual');
    fireEvent.click(manualCheckbox);

    expect(mockProps.onAccessTypeChange).toHaveBeenCalledWith(['manual']);
  });

  it('should show clear filters button when filters are active', () => {
    const props = {
      ...mockProps,
      statusFilters: ['active' as const],
    };

    render(<UserFilters {...props} />);

    expect(screen.getByText('Limpar filtros')).toBeInTheDocument();
  });

  it('should clear all filters when clear button clicked', () => {
    const props = {
      ...mockProps,
      statusFilters: ['active' as const],
      accessTypeFilters: ['manual' as const],
    };

    render(<UserFilters {...props} />);

    const clearButton = screen.getByText('Limpar filtros');
    fireEvent.click(clearButton);

    expect(mockProps.onStatusChange).toHaveBeenCalledWith([]);
    expect(mockProps.onAccessTypeChange).toHaveBeenCalledWith([]);
  });

  it('should allow multiple status filters', () => {
    render(<UserFilters {...mockProps} />);

    const statusDropdown = screen.getByText('Status');
    fireEvent.click(statusDropdown);

    fireEvent.click(screen.getByText('Ativo'));
    expect(mockProps.onStatusChange).toHaveBeenLastCalledWith(['active']);

    fireEvent.click(screen.getByText('Expirado'));
    expect(mockProps.onStatusChange).toHaveBeenLastCalledWith(['active', 'expired']);
  });

  it('should allow multiple access type filters', () => {
    render(<UserFilters {...mockProps} />);

    const accessTypeDropdown = screen.getByText('Tipo de Acesso');
    fireEvent.click(accessTypeDropdown);

    fireEvent.click(screen.getByText('Manual'));
    expect(mockProps.onAccessTypeChange).toHaveBeenLastCalledWith(['manual']);

    fireEvent.click(screen.getByText('Pago'));
    expect(mockProps.onAccessTypeChange).toHaveBeenLastCalledWith(['manual', 'paid']);
  });
});
