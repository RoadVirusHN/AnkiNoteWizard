import Tabs from '@/front/common/Tabs/Tabs';
import mainStyle from "./main.module.css";
import { Outlet } from 'react-router';

const Popup: React.FC = () => {
 
  return (
    <div className={mainStyle.main}>
      <Tabs/>
      <div className={mainStyle["main-content"]}>
        <Outlet/>
      </div>
    </div>
  );
};

export default Popup;