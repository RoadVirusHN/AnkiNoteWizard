import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './popup.css';

const Popup: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const checkConnection = async () => {
    await fetch('http://127.0.0.1:8765', {
      method: 'POST',
      body: JSON.stringify({ action: 'deckNames', version: 5 }),
    })
      .then(async (res) => {
        const data = await res.json();
        console.log(data);
        setIsConnected(data.error === null);
      })
      .catch((err) => {
        console.log(err);
        setIsConnected(false);
      });
  };
  useEffect(() => {
    checkConnection();
  }, []);
  return (
    <div className="popup">
      <h3>Popup Test</h3>
      <button onClick={() => checkConnection()}>Check</button>
      {isConnected ? 'connected!' : 'disconnected'}
    </div>
  );
};

const container = document.getElementById('root');
if (container) createRoot(container).render(<Popup />);
