import React from 'react';

const ContentView = ({ contentToShow, onBack }) => {
  return (
    <div className="content-view">
      <button onClick={onBack} style={{ marginBottom: '10px' }}>Back to List</button>
      {typeof contentToShow === 'string' && contentToShow.startsWith('<') ? (
        <div dangerouslySetInnerHTML={{ __html: contentToShow }} />
      ) : (
        <p>{contentToShow}</p>
      )}
    </div>
  );
};

export default ContentView;
