import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BudgetForm } from './budget-form';

describe('BudgetForm Component', () => {
  it('should render form elements', () => {
    render(<BudgetForm onSubmit={() => {}} isLoading={false} />);
    
    expect(screen.getByLabelText(/what are you looking for/i)).toBeDefined();
    expect(screen.getByText(/max budget/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /find deals/i })).toBeDefined();
  });

  it('should call onSubmit with correct data', () => {
    const handleSubmit = vi.fn();
    render(<BudgetForm onSubmit={handleSubmit} isLoading={false} />);

    const input = screen.getByLabelText(/what are you looking for/i);
    fireEvent.change(input, { target: { value: 'Laptop' } });

    const button = screen.getByRole('button', { name: /find deals/i });
    fireEvent.click(button);

    expect(handleSubmit).toHaveBeenCalledWith({
      query: 'Laptop',
      maxBudget: 500, // Default
      priority: 'quality', // Default
    });
  });

  it('should disable inputs when loading', () => {
    render(<BudgetForm onSubmit={() => {}} isLoading={true} />);
    
    const input = screen.getByLabelText(/what are you looking for/i) as HTMLInputElement;
    expect(input.disabled).toBe(true);
    
    const button = screen.getByRole('button', { name: /analyzing market/i }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});
