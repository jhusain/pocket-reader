import React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
// import LinkIcon from '@mui/icons-material/Link'; // Example, if needed for 'loaded' state

const UrlItem = ({ urlObject, onUrlClick }) => {
  const handleClick = () => {
    onUrlClick(urlObject);
  };

  // Determine the primary text: show title if available and loaded, otherwise URL.
  // For unloaded or loading states, URL is more informative as title might not be fetched yet.
  let primaryText = urlObject.url;
  if (urlObject.status === 'loaded' && urlObject.title) {
    primaryText = urlObject.title;
  } else if (urlObject.title) { // If title is somehow available but not 'loaded' (e.g. from share)
    primaryText = urlObject.title;
  }


  // Determine secondary text:
  // - If title is shown as primary, URL becomes secondary.
  // - Error messages are also shown as secondary.
  let secondaryTextElements = [];
  if (primaryText === urlObject.title && urlObject.url !== urlObject.title) { // Show URL as secondary if title is primary
    secondaryTextElements.push(
      <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block' }} key="url">
        {urlObject.url}
      </Typography>
    );
  }

  if (urlObject.status === 'error' && urlObject.errorMessage) {
    secondaryTextElements.push(
      <Typography component="span" variant="caption" color="error" sx={{ display: 'block' }} key="error">
        Error: {urlObject.errorMessage}
      </Typography>
    );
  }

  // Show status if it's 'loading' (unless already handled by primary/secondary text or icon)
  // Or if it's 'unloaded' and no specific error/title is present.
  if (urlObject.status === 'unloaded' && !urlObject.title && !secondaryTextElements.length) {
     secondaryTextElements.push(
        <Typography component="span" variant="caption" color="text.disabled" sx={{ display: 'block' }} key="status-unloaded">
          Status: Unloaded
        </Typography>
     );
  }


  return (
    <ListItemButton onClick={handleClick} divider>
      {(urlObject.status === 'loading' || urlObject.status === 'error') && (
        <ListItemIcon sx={{minWidth: '40px'}}> {/* Adjust minWidth if icons look too spaced out */}
          {urlObject.status === 'loading' && <CircularProgress size={24} />}
          {urlObject.status === 'error' && <ErrorOutlineIcon color="error" />}
        </ListItemIcon>
      )}
      {/* If no icon for loading/error, add an empty ListItemIcon to align text if other items have icons */}
      {/* This can be removed if no items ever have icons other than loading/error */}
      {/* {urlObject.status !== 'loading' && urlObject.status !== 'error' && <ListItemIcon sx={{minWidth: '40px'}} />} */}

      <ListItemText
        primary={primaryText}
        secondary={secondaryTextElements.length > 0 ? <React.Fragment>{secondaryTextElements}</React.Fragment> : null}
      />
    </ListItemButton>
  );
};

export default UrlItem;
