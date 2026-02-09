import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressBar from '../../../components/common/ProgressBar';

describe('ProgressBar', () => {
  it('should render progress bar with correct progress', () => {
    render(<ProgressBar progress={50} label="Test Progress" />);
    expect(screen.getByText('Test Progress')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should clamp progress to 0-100', () => {
    const { container } = render(<ProgressBar progress={150} />);
    const fill = container.querySelector('.progress-bar-fill');
    expect(fill.style.width).toBe('100%');
  });

  it('should handle negative progress', () => {
    const { container } = render(<ProgressBar progress={-10} />);
    const fill = container.querySelector('.progress-bar-fill');
    expect(fill.style.width).toBe('0%');
  });
});
