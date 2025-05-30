import React, { useState, useEffect, useCallback } from 'react';
import localforage from 'localforage';
import { defuddle } from 'defuddle'; // Assuming defuddle is an ES module or has type definitions

import './App.css';
import UrlList from './UrlList';
import ContentView from './ContentView';
import SharedUrlReceiver from './SharedUrlReceiver'; // Import the new component

// Configure localforage instance if needed
localforage.config({
  name: 'UrlViewerPWA',
  storeName: 'urls',
  description: 'Storage for URL data',
});

function App() {
  const [urls, setUrls] = useState([]); // {url: string, title?: string, simplifiedHtml?: string, status: 'unloaded' | 'loading' | 'loaded' | 'error', errorMessage?: string}
  const [currentView, setCurrentView] = useState('list'); // 'list' | 'content' | 'shared_content_view'
  const [contentToShow, setContentToShow] = useState(''); // HTML string or error message
  const [sharedData, setSharedData] = useState(null); // {title, text, url}

  // Effect for handling shared URL
  useEffect(() => {
    const publicUrl = process.env.PUBLIC_URL || '';
    // Ensure sharePath has a trailing slash if your manifest action has it.
    // The manifest action "shared-url-handler/" implies it will be a directory.
    const sharePath = `${publicUrl}/shared-url-handler/`; 
    
    let currentPathname = window.location.pathname;
    // Normalize currentPathname to ensure it also has a trailing slash if sharePath does
    if (sharePath.endsWith('/') && !currentPathname.endsWith('/')) {
      currentPathname += '/';
    }

    if (currentPathname === sharePath) {
      const params = new URLSearchParams(window.location.search);
      const url = params.get('url');
      const title = params.get('title');
      const text = params.get('text');

      if (url) {
        setSharedData({ url, title, text });
        setCurrentView('shared_content_view');
        // Optional: Clear search params from URL bar after processing
        // window.history.replaceState({}, '', publicUrl || '/'); 
      }
    }
  }, []); // Empty dependency array to run once on mount

  // Load URLs from localforage on initial render
  useEffect(() => {
    const loadUrls = async () => {
      try {
        const storedUrls = await localforage.getItem('appUrls');
        if (storedUrls && Array.isArray(storedUrls)) {
          setUrls(storedUrls);
        } else {
          // For testing, add some default URLs if none are stored
          const defaultUrls = [
            { url: 'https://www.google.com', status: 'unloaded' },
            { url: 'https://www.wikipedia.org', status: 'unloaded' },
          ];
          setUrls(defaultUrls);
          await localforage.setItem('appUrls', defaultUrls);
        }
      } catch (error) {
        console.error('Failed to load URLs from localforage:', error);
        // Initialize with default if error
         const defaultUrls = [
            { url: 'https://www.google.com', status: 'unloaded' },
            { url: 'https://www.wikipedia.org', status: 'unloaded' },
          ];
        setUrls(defaultUrls);
      }
    };
    loadUrls();
  }, []);

  // Save URLs to localforage whenever they change
  useEffect(() => {
    if (urls.length > 0) { // Avoid saving empty initial array if not loaded yet
        localforage.setItem('appUrls', urls).catch(error => {
            console.error('Failed to save URLs to localforage:', error);
        });
    }
  }, [urls]);

  const updateUrlData = useCallback((targetUrl, newData) => {
    setUrls(prevUrls =>
      prevUrls.map(u => (u.url === targetUrl ? { ...u, ...newData } : u))
    );
  }, []);

  const handleUrlClick = useCallback(async (urlObject) => {
    if (urlObject.status === 'loaded' && urlObject.simplifiedHtml) {
      setContentToShow(urlObject.simplifiedHtml);
      setCurrentView('content');
    } else if (urlObject.status === 'unloaded' || urlObject.status === 'error') {
      updateUrlData(urlObject.url, { status: 'loading', errorMessage: undefined });
      setContentToShow('Loading ' + urlObject.url + '...');
      setCurrentView('content'); // Show loading message in content view

      try {
        // console.log(`Fetching URL: ${urlObject.url}`);
        // NOTE: The browser's CORS policy will likely block direct fetch requests 
        // from a client-side app to arbitrary external websites.
        // This will require a CORS proxy server to fetch the content.
        // For this example, we'll assume direct fetch *could* work or 
        // that a proxy is implicitly handled by the environment.
        // If this fails, it will be caught by the catch block.

        // A common workaround is to use a CORS proxy.
        // For example: `https://cors-anywhere.herokuapp.com/${urlObject.url}`
        // IMPORTANT: Public CORS proxies are often rate-limited or unreliable for production.
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(urlObject.url)}`;
        // const response = await fetch(urlObject.url); // Original direct fetch
        const response = await fetch(proxyUrl);


        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} for ${urlObject.url}`);
        }
        const htmlContent = await response.text();
        // console.log(`Fetched HTML for: ${urlObject.url}`);

        const simplifiedHtml = defuddle(htmlContent);
        // console.log(`Simplified HTML (first 100 chars): ${simplifiedHtml.substring(0,100)}`);
        
        // Basic title parsing (defuddle might already provide this or a more robust way)
        const titleMatch = simplifiedHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch && titleMatch[1] ? titleMatch[1].trim() : 'No title found';
        // console.log(`Parsed title: ${title}`);

        updateUrlData(urlObject.url, {
          title,
          simplifiedHtml,
          status: 'loaded',
        });
        setContentToShow(simplifiedHtml);
        // setCurrentView('content'); // Already in content view
      } catch (error) {
        console.error('Failed to load or process URL:', error);
        const errorMessage = error.message || 'Failed to load and process URL.';
        updateUrlData(urlObject.url, { status: 'error', errorMessage });
        setContentToShow(`Error loading ${urlObject.url}: ${errorMessage}`);
        // setCurrentView('content'); // Already in content view
      }
    }
  }, [updateUrlData]);

  const handleBackToList = () => {
    setCurrentView('list');
    setContentToShow('');
    setSharedData(null); // Also clear shared data
  };

  const handleClearSharedView = () => {
    setSharedData(null);
    setCurrentView('list');
    // Optional: Navigate to the base path if not already there
    // window.history.pushState({}, '', process.env.PUBLIC_URL || '/');
  };
  
  // Simple input for adding new URLs - OPTIONAL but useful for testing
  const [newUrlInput, setNewUrlInput] = useState('');
  const handleAddUrl = () => {
    if (newUrlInput.trim() && !urls.find(u => u.url === newUrlInput.trim())) {
      setUrls(prevUrls => [...prevUrls, { url: newUrlInput.trim(), status: 'unloaded' }]);
      setNewUrlInput('');
    }
  };


  return (
    <div className="App">
      <header className="App-header">
        <h1>URL Viewer PWA</h1>
        {currentView === 'content' && <button onClick={handleBackToList} style={{position: 'absolute', top: '20px', right: '20px'}}>Back to List</button>}
      </header>
      <main>
        {/* Optional: Input for adding new URLs */}
        {currentView === 'list' && (
          <div style={{ padding: '10px', display: 'flex' }}>
            <input 
              type="url" 
              value={newUrlInput} 
              onChange={(e) => setNewUrlInput(e.target.value)} 
              placeholder="Enter URL to add"
              style={{ flexGrow: 1, marginRight: '5px' }}
            />
            <button onClick={handleAddUrl}>Add URL</button>
          </div>
        )}

        {currentView === 'list' && (
          <UrlList urls={urls} onUrlClick={handleUrlClick} />
        )}
        {currentView === 'content' && (
          <ContentView contentToShow={contentToShow} onBack={handleBackToList} />
        )}
        {currentView === 'shared_content_view' && sharedData && (
          <SharedUrlReceiver data={sharedData} onClear={handleClearSharedView} />
        )}
      </main>
    </div>
  );
}

export default App;
