/**
 * UserSearchInput Component Tests
 *
 * Tests for search input component with debouncing.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserSearchInput } from '../UserSearchInput';

describe('UserSearchInput', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render search input with icon', () => {
    const onChange = vi.fn();
    render(<UserSearchInput value="" onChange={onChange} />);

    const input = screen.getByPlaceholderText('Buscar por nome ou email...');
    expect(input).toBeInTheDocument();
  });

  it('should update local value immediately on input', () => {
    const onChange = vi.fn();
    render(<UserSearchInput value="" onChange={onChange} />);

    const input = screen.getByPlaceholderText('Buscar por nome ou email...');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(input).toHaveValue('test');
  });

  it('should debounce onChange callback', async () => {
    const onChange = vi.fn();
    render(<UserSearchInput value="" onChange={onChange} />);

    const input = screen.getByPlaceholderText('Buscar por nome ou email...');
    fireEvent.change(input, { target: { value: 'test' } });

    // Should not call onChange immediately
    expect(onChange).not.toHaveBeenCalled();

    // Fast-forward 250ms (still within debounce period)
    vi.advanceTimersByTime(250);
    expect(onChange).not.toHaveBeenCalled();

    // Complete debounce period
    vi.advanceTimersByTime(50);
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('test');
    });
  });

  it('should reset debounce timer on rapid input changes', async () => {
    const onChange = vi.fn();
    render(<UserSearchInput value="" onChange={onChange} />);

    const input = screen.getByPlaceholderText('Buscar por nome ou email...');

    fireEvent.change(input, { target: { value: 't' } });
    vi.advanceTimersByTime(100);

    fireEvent.change(input, { target: { value: 'te' } });
    vi.advanceTimersByTime(100);

    fireEvent.change(input, { target: { value: 'test' } });
    vi.advanceTimersByTime(100);

    // Should not have called onChange yet
    expect(onChange).not.toHaveBeenCalled();

    // Complete debounce period from last change
    vi.advanceTimersByTime(200);
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('test');
    });
  });

  it('should show clear button when value is present', () => {
    const onChange = vi.fn();
    render(<UserSearchInput value="test" onChange={onChange} />);

    const clearButton = screen.getByRole('button');
    expect(clearButton).toBeInTheDocument();
  });

  it('should not show clear button when value is empty', () => {
    const onChange = vi.fn();
    render(<UserSearchInput value="" onChange={onChange} />);

    const clearButton = screen.queryByRole('button');
    expect(clearButton).not.toBeInTheDocument();
  });

  it('should clear input and call onChange when clear button clicked', () => {
    const onChange = vi.fn();
    render(<UserSearchInput value="test" onChange={onChange} />);

    const input = screen.getByPlaceholderText('Buscar por nome ou email...');
    const clearButton = screen.getByRole('button');

    fireEvent.click(clearButton);

    expect(input).toHaveValue('');
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('should use custom placeholder', () => {
    const onChange = vi.fn();
    render(
      <UserSearchInput
        value=""
        onChange={onChange}
        placeholder="Custom placeholder"
      />
    );

    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  });
});
