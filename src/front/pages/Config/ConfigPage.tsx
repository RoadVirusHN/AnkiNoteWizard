import commonStyle from '@/front/common.module.css';
import configPageStyle from "./configPage.module.css";
import { useState } from 'react';

enum TAB { GENERAL="general", Template='template', CARD="card", ABOUT="about" };

const ConfigPage: React.FC = () => {
 
  const [activeTab, setActiveTab] = useState<TAB>(TAB.GENERAL);
  return (
    <div>
      <div className={configPageStyle.tabs}>
        {Object.values(TAB).map(tab => 
          <button
            key={tab}
            className={`${configPageStyle.tab} ${activeTab === tab ? configPageStyle.activeTab : ""}`}
            onClick={() => setActiveTab(tab as TAB)}>
            {tab}
          </button>)}
      </div>
    </div>
  );
};

export default ConfigPage;
