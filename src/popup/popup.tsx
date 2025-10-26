import { createRoot } from 'react-dom/client';
import commonStyle from '@/popup/css/common.module.css';
import AnkiStatus from '@/popup/AnkiStatus';

const Popup: React.FC = () => {
 
  return (
    <div className={commonStyle.popup}>
      <h3>Popup Test</h3>
      <AnkiStatus/>
    </div>
  );
};

const container = document.getElementById('root');
if (container) createRoot(container).render(<Popup />);
