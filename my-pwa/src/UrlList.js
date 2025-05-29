import React from 'react';
import UrlItem from './UrlItem';

const UrlList = ({ urls, onUrlClick }) => {
  return (
    <div className="url-list">
      {urls.map((urlObj, index) => (
        <UrlItem key={index} urlObject={urlObj} onUrlClick={onUrlClick} />
      ))}
    </div>
  );
};

export default UrlList;
