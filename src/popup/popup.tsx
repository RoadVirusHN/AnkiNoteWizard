import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './popup.css';
import AnkiConnection from './AnkiConnection';

const Popup: React.FC = () => {
 
  return (
    <div className="popup">
      <h3>Popup Test</h3>
      <AnkiConnection/>
    </div>
  );
};

const container = document.getElementById('root');
if (container) createRoot(container).render(<Popup />);
