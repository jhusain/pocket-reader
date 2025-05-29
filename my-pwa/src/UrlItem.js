import React from 'react';

const UrlItem = ({ urlObject, onUrlClick }) => {
  const handleClick = () => {
    onUrlClick(urlObject);
  };

  return (
    <div className="url-item" onClick={handleClick} style={{ cursor: 'pointer', margin: '5px 0', padding: '10px', border: '1px solid #ccc' }}>
      {urlObject.status === 'loaded' ? urlObject.title : urlObject.url}
      {urlObject.status === 'error' && <span style={{ color: 'red', marginLeft: '10px' }}>Error: {urlObject.errorMessage}</span>}
    </div>
  );
};

export default UrlItem;
