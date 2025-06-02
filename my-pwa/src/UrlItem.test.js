import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UrlItem from './UrlItem';

describe('UrlItem component', () => {
  const mockUrlObject = {
    url: 'https://example.com',
    title: 'Example Site',
    status: 'loaded', // or 'unloaded', 'loading', 'error'
    simplifiedHtml: '<p>Example HTML</p>',
    errorMessage: undefined,
  };

  test('renders URL information correctly', () => {
    render(<UrlItem urlObject={mockUrlObject} onUrlClick={jest.fn()} onDeleteUrl={jest.fn()} />);
    
    // Check if title is rendered (since status is 'loaded' and title exists)
    expect(screen.getByText(mockUrlObject.title)).toBeInTheDocument();
    // Check if URL is rendered as secondary text
    expect(screen.getByText(mockUrlObject.url)).toBeInTheDocument(); 
  });

  test('calls onUrlClick when the item is clicked', () => {
    const mockOnUrlClick = jest.fn();
    render(<UrlItem urlObject={mockUrlObject} onUrlClick={mockOnUrlClick} onDeleteUrl={jest.fn()} />);
    
    // Click the main body of the list item
    // The primary text (title) is a good target if the whole item is clickable
    fireEvent.click(screen.getByText(mockUrlObject.title));
    expect(mockOnUrlClick).toHaveBeenCalledTimes(1);
    expect(mockOnUrlClick).toHaveBeenCalledWith(mockUrlObject);
  });

  test('calls onDeleteUrl with the correct URL when delete button is clicked', () => {
    const mockOnDeleteUrl = jest.fn();
    render(<UrlItem urlObject={mockUrlObject} onUrlClick={jest.fn()} onDeleteUrl={mockOnDeleteUrl} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete url/i });
    fireEvent.click(deleteButton);
    
    expect(mockOnDeleteUrl).toHaveBeenCalledTimes(1);
    expect(mockOnDeleteUrl).toHaveBeenCalledWith(mockUrlObject.url);
  });

  test('clicking delete button does not trigger onUrlClick', () => {
    const mockOnUrlClick = jest.fn();
    const mockOnDeleteUrl = jest.fn();
    render(<UrlItem urlObject={mockUrlObject} onUrlClick={mockOnUrlClick} onDeleteUrl={mockOnDeleteUrl} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete url/i });
    fireEvent.click(deleteButton);
    
    expect(mockOnDeleteUrl).toHaveBeenCalledTimes(1);
    expect(mockOnUrlClick).not.toHaveBeenCalled();
  });

  // Test for different statuses (loading, error, unloaded) can be added here
  test('displays loading indicator when status is "loading"', () => {
    const loadingUrlObject = { ...mockUrlObject, status: 'loading', title: undefined };
    render(<UrlItem urlObject={loadingUrlObject} onUrlClick={jest.fn()} onDeleteUrl={jest.fn()} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    // URL should be primary text if no title and loading
    expect(screen.getByText(loadingUrlObject.url)).toBeInTheDocument();
  });

  test('displays error icon and message when status is "error"', () => {
    const errorUrlObject = { 
      ...mockUrlObject, 
      status: 'error', 
      errorMessage: 'Failed to load', 
      title: 'Error Page' // Title might exist even if there was an error
    };
    render(<UrlItem urlObject={errorUrlObject} onUrlClick={jest.fn()} onDeleteUrl={jest.fn()} />);
    expect(screen.getByTestId('ErrorOutlineIcon')).toBeInTheDocument(); // MUI icons often have test IDs like this, or check role
    expect(screen.getByText(`Error: ${errorUrlObject.errorMessage}`)).toBeInTheDocument();
    // Title should still be shown if available
     expect(screen.getByText(errorUrlObject.title)).toBeInTheDocument();
  });

});
