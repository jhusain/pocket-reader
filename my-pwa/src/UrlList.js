import React from 'react';
import UrlItem from './UrlItem';
import List from '@mui/material/List';

const UrlList = ({ urls, onUrlClick }) => {
  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {urls.map((urlObj, index) => ( // Using index as key is not ideal if list can be reordered, but ok for now
        <UrlItem key={urlObj.url || index} urlObject={urlObj} onUrlClick={onUrlClick} />
      ))}
    </List>
  );
};

export default UrlList;
