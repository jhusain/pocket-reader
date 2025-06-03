import React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
// import LinkIcon from '@mui/icons-material/Link'; // Example, if needed for 'loaded' state

const UrlItem = ({ urlObject, onUrlClick, onDeleteUrl }) => {
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
    <ListItem component="li" divider disableGutters sx={{ position: 'relative' }}>
      <ListItemButton
        onClick={handleClick}
        // sx={{ flexGrow: 1 }} // flexGrow might not be needed if pr is set correctly
        sx={{
          pr: 9, // Padding right for the secondary action
          // flexGrow: 1, // Optional: see if needed with padding
        }}
      >
        {(urlObject.status === 'loading' || urlObject.status === 'error') && (
          <ListItemIcon sx={{minWidth: '40px'}}> {/* Adjust minWidth if icons look too spaced out */}
            {urlObject.status === 'loading' && <CircularProgress size={24} />}
            {urlObject.status === 'error' && <ErrorOutlineIcon color="error" />}
          </ListItemIcon>
        )}
        {/* Optional: Add placeholder for alignment if needed, though flexGrow on ListItemButton might handle this better
        {urlObject.status !== 'loading' && urlObject.status !== 'error' && <ListItemIcon sx={{minWidth: '40px', visibility: 'hidden'}} />}
        */}
        <ListItemText
          primary={primaryText}
          secondary={secondaryTextElements.length > 0 ? <React.Fragment>{secondaryTextElements}</React.Fragment> : null}
        />
      </ListItemButton>
      <ListItemSecondaryAction>
        <IconButton
          edge="end"
          aria-label="delete url"
          onClick={(event) => {
            event.stopPropagation(); // Important if the ListItem itself could have a click listener, though less critical here as the button is outside the ListItemButton's main click area.
            onDeleteUrl(urlObject.url);
          }}
        >
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default UrlItem;
