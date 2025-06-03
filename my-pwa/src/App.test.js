import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import App from './App';
import { getAllUrls, saveUrls, initDB } from './indexedDBUtils';

// Mock the indexedDBUtils module
jest.mock('./indexedDBUtils');

describe('App component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    getAllUrls.mockReset();
    saveUrls.mockReset();
    initDB.mockReset();

    // Default mock implementations
    initDB.mockResolvedValue(undefined); // Simulate successful DB initialization
    saveUrls.mockResolvedValue(undefined); // Simulate successful save
  });

  test('renders app title and can add and delete a URL', async () => {
    const initialUrls = [
      { url: 'https://example.com/page1', title: 'Page 1', status: 'loaded', simplifiedHtml: '<p>Page 1</p>' },
      { url: 'https://example.com/page2', title: 'Page 2', status: 'unloaded' },
    ];
    getAllUrls.mockResolvedValue([...initialUrls]); // Return a copy

    render(<App />);

    // Check for App Bar title
    expect(screen.getByText(/URL Viewer PWA/i)).toBeInTheDocument();

    // Wait for initial URLs to be loaded and displayed
    // Ensure items are rendered by looking for their primary text (title or URL)
    await waitFor(async () => { // Make inner function async for findBy
      expect(await screen.findByText(initialUrls[0].title)).toBeInTheDocument();
      expect(await screen.findByText(initialUrls[1].url)).toBeInTheDocument(); // Page 2 has no title initially
    });

    // --- Test Deletion ---
    // 1. Find the ListItemButton (which has role="button" and the name we know)
    const listItemButton = screen.getByRole('button', { name: new RegExp(initialUrls[0].title, 'i') });

    // 2. Find its parent <li> element. This is the actual listitem container.
    const listItemPage1 = listItemButton.closest('li');
    expect(listItemPage1).toBeInTheDocument(); // Make sure we found the parent li

    // 3. Find the delete button within this parent <li>
    const deleteButtonPage1 = within(listItemPage1).getByRole('button', { name: /delete url/i });
    fireEvent.click(deleteButtonPage1);

    // Wait for the URL to be removed
    await waitFor(() => {
      expect(screen.queryByText(initialUrls[0].title)).not.toBeInTheDocument();
    });

    // Ensure the second URL is still present
    expect(screen.getByText(initialUrls[1].url)).toBeInTheDocument();

    // Check if saveUrls was called after deletion (it should be, due to useEffect in App.js)
    // The state updates, triggering the useEffect hook that calls saveUrls.
    // The argument to saveUrls should be the list of URLs *after* deletion.
    await waitFor(() => {
      expect(saveUrls).toHaveBeenCalledTimes(2);

      // Check the arguments of the LAST call to saveUrls
      expect(saveUrls).toHaveBeenLastCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ url: initialUrls[1].url }), // Should contain Page 2
        ])
      );
      expect(saveUrls).toHaveBeenLastCalledWith(
        expect.not.arrayContaining([
          expect.objectContaining({ url: initialUrls[0].url }), // Should NOT contain Page 1
        ])
      );
    });

    // --- Test Addition (Optional but good to keep a comprehensive test) ---
    const newUrl = 'https://example.com/newpage';
    const urlInput = screen.getByLabelText(/Enter URL to add/i);
    const addButton = screen.getByRole('button', { name: /Add URL/i });

    fireEvent.change(urlInput, { target: { value: newUrl } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(newUrl)).toBeInTheDocument();
    });

    // Verify saveUrls was called again after addition
    await waitFor(() => {
        expect(saveUrls).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({ url: initialUrls[1].url }),
                expect.objectContaining({ url: newUrl, status: 'unloaded' })
            ])
        );
    });

  });

  // Test for initial empty state or error loading from DB can be added here
  test('renders correctly when no URLs are in IndexedDB', async () => {
    getAllUrls.mockResolvedValue([]); // No URLs stored
    render(<App />);
    // Check that default URLs are added (as per App.js logic)
    await waitFor(() => {
      expect(screen.getByText('https://www.google.com')).toBeInTheDocument();
      expect(screen.getByText('https://www.wikipedia.org')).toBeInTheDocument();
    });
    // And that these defaults are then saved
    await waitFor(() => {
        expect(saveUrls).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({ url: 'https://www.google.com' }),
                expect.objectContaining({ url: 'https://www.wikipedia.org' })
            ])
        );
    });
  });

});
