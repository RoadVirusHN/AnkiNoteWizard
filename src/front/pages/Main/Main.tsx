import commonStyle from '@/front/common.module.css';
import Tabs from '@/front/components/Tabs/Tabs';
import { Outlet } from 'react-router';

const Popup: React.FC = () => {
 
  return (
    <div className={commonStyle.main}>
      <Tabs/>
      <div className={commonStyle["main-content"]}>
        <Outlet/>
      </div>
    </div>
  );
};

export default Popup;