import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const ContentView = ({ contentToShow }) => { // Removed onBack from props
  // Basic check for error messages to apply styling.
  // A more robust solution might involve passing an explicit error flag or type.
  const isError = typeof contentToShow === 'string' &&
                  (contentToShow.toLowerCase().includes('error') ||
                   contentToShow.toLowerCase().includes('failed to load'));

  return (
    <Paper elevation={1} sx={{ padding: { xs: 2, sm: 3 }, marginTop: 2, marginBottom: 2, overflowWrap: 'break-word', wordWrap: 'break-word' }}>
      {isError ? (
        <Typography color="error" component="div">{contentToShow}</Typography>
      ) : typeof contentToShow === 'string' && contentToShow.startsWith('<') ? (
        // Using component="div" for Typography to allow block-level HTML inside,
        // or just Box for direct HTML rendering.
        // Box is simpler if no Typography specific styling is needed for the container.
        <Box className="html-content-wrapper" dangerouslySetInnerHTML={{ __html: contentToShow }} />
      ) : (
        // For non-HTML, non-error messages (e.g., "Loading...")
        <Typography component="div">{contentToShow}</Typography>
      )}
    </Paper>
  );
};

export default ContentView;
