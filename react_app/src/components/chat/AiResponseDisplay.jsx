// src/components/AiResponseDisplay.jsx

import React from 'react';
import ReactMarkdown from 'react-markdown';

function AiResponseDisplay({ aiText }) {
  return (
    <div className="ai-response-container">
      <ReactMarkdown>{aiText}</ReactMarkdown>
    </div>
  );
}

export default AiResponseDisplay;