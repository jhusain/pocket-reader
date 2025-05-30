import React from 'react';

function SharedUrlReceiver({ data, onClear }) {
  if (!data) {
    // This case should ideally not be reached if App.js only renders it when data is present
    return <p>No shared data available. Waiting for share...</p>;
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #eee', margin: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
      <h2 style={{ marginTop: '0' }}>Shared Content Received:</h2>
      {data.title && <p><strong>Title:</strong> {data.title}</p>}
      {data.text && <p><strong>Text:</strong> {data.text}</p>}
      {data.url && (
        <p>
          <strong>URL:</strong>{' '}
          <a href={data.url} target="_blank" rel="noopener noreferrer">
            {data.url}
          </a>
        </p>
      )}
      {!data.url && <p><em>No URL was shared.</em></p>}
      <button 
        onClick={onClear} 
        style={{ 
          marginTop: '15px', 
          padding: '10px 15px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: 'pointer' 
        }}
      >
        Clear Shared Content & View List
      </button>
    </div>
  );
}

export default SharedUrlReceiver;
