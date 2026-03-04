/**
 * useDebounce Hook Tests
 *
 * Tests for the debounce hook that delays value updates.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('should update debounced value after delay', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 300 },
      }
    );

    expect(result.current).toBe('initial');

    // Update the value
    rerender({ value: 'updated', delay: 300 });

    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Wait for state update
    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });

  it('should reset timer on value change', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      {
        initialProps: { value: 'initial' },
      }
    );

    // First update
    rerender({ value: 'first' });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Second update before timer completes
    rerender({ value: 'second' });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should still be initial (not enough time since last update)
    expect(result.current).toBe('initial');

    // Complete the timer
    act(() => {
      vi.advanceTimersByTime(200);
    });

    await waitFor(() => {
      expect(result.current).toBe('second');
    });
  });

  it('should cleanup timer on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    const { unmount, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      {
        initialProps: { value: 'initial' },
      }
    );

    rerender({ value: 'updated' });

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('should work with different types', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      {
        initialProps: { value: 0 },
      }
    );

    expect(result.current).toBe(0);

    rerender({ value: 42 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(result.current).toBe(42);
    });
  });

  it('should use default 300ms delay', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 'initial' },
    });

    rerender({ value: 'updated' });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });
});
