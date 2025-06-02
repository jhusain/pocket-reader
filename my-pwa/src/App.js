import React, { useState, useEffect, useCallback } from 'react';
// import localforage from 'localforage'; // Removed
import { initDB, getAllUrls, saveUrls } from './indexedDBUtils'; // Added
import { defuddle } from 'defuddle'; // Assuming defuddle is an ES module or has type definitions

import './App.css';
import UrlList from './UrlList';
import ContentView from './ContentView';

// MUI Imports
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Optional icon

// SharedUrlReceiver import removed

// localforage.config block removed

function App() {
  const [urls, setUrls] = useState([]); // {url: string, title?: string, simplifiedHtml?: string, status: 'unloaded' | 'loading' | 'loaded' | 'error', errorMessage?: string}
  const [currentView, setCurrentView] = useState('list'); // 'list' | 'content'
  const [contentToShow, setContentToShow] = useState(''); // HTML string or error message
  // sharedData state removed

  // Effect for handling shared URL removed

  // Initialize DB on component mount
  useEffect(() => {
    initDB().catch(err => console.error("App.js: Failed to initialize DB on mount:", err));
  }, []);

  // Load URLs from IndexedDB on initial render
  useEffect(() => {
    const loadUrls = async () => {
      try {
        const storedUrls = await getAllUrls();
        if (storedUrls && Array.isArray(storedUrls) && storedUrls.length > 0) {
          setUrls(storedUrls);
        } else {
          // For testing, add some default URLs if none are stored
          const defaultUrls = [
            { url: 'https://www.google.com', status: 'unloaded' },
            { url: 'https://www.wikipedia.org', status: 'unloaded' },
          ];
          setUrls(defaultUrls);
          // saveUrls will be called by the next useEffect if urls state changes
        }
      } catch (error) {
        console.error('Failed to load URLs from IndexedDB:', error);
        // Initialize with default if error
         const defaultUrls = [
            { url: 'https://www.google.com', status: 'unloaded' },
            { url: 'https://www.wikipedia.org', status: 'unloaded' },
          ];
        setUrls(defaultUrls);
      }
    };
    loadUrls();
  }, []); // Empty dependency array means this runs once on mount

  // Save URLs to IndexedDB whenever they change
  useEffect(() => {
    // Only save if urls is not the initial empty array before loading
    // or if it's been populated with defaults that now need saving.
    if (urls.length > 0) { 
      saveUrls(urls).catch(error => {
          console.error('Failed to save URLs to IndexedDB:', error);
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
    // setSharedData(null) removed;
  };

  // handleClearSharedView function removed
  
  // Simple input for adding new URLs - OPTIONAL but useful for testing
  const [newUrlInput, setNewUrlInput] = useState('');
  const handleAddUrl = () => {
    if (newUrlInput.trim() && !urls.find(u => u.url === newUrlInput.trim())) {
      setUrls(prevUrls => [...prevUrls, { url: newUrlInput.trim(), status: 'unloaded' }]);
      setNewUrlInput('');
    }
  };


  return (
    <div className="App"> {/* Outer div can remain for now, or be replaced by Box/Fragment if App.css is fully removed later */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            URL Viewer PWA
          </Typography>
          {currentView === 'content' && (
            <Button color="inherit" onClick={handleBackToList} startIcon={<ArrowBackIcon />}>
              Back to List
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ marginTop: 2, marginBottom: 2 }}>
        <main>
          {/* Optional: Input for adding new URLs */}
          {currentView === 'list' && (
            <Box sx={{ padding: '16px 0px', display: 'flex', alignItems: 'center', marginBottom: 2 }}>
              <TextField
                type="url"
                label="Enter URL to add"
                variant="outlined"
                size="small"
                value={newUrlInput}
                onChange={(e) => setNewUrlInput(e.target.value)}
                sx={{ flexGrow: 1, marginRight: 1 }}
              />
              <Button variant="contained" onClick={handleAddUrl}>
                Add URL
              </Button>
            </Box>
          )}

          {currentView === 'list' && (
            <UrlList urls={urls} onUrlClick={handleUrlClick} />
          )}
          {currentView === 'content' && (
            <ContentView contentToShow={contentToShow} onBack={handleBackToList} />
          )}
          {/* SharedUrlReceiver rendering logic removed */}
        </main>
      </Container>
    </div>
  );
}

export default App;
