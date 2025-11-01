import commonStyle from '@/front/common.module.css';
import SideBar from '@/front/components/SideBar/SideBar';
import { Outlet } from 'react-router';
import Footer from '../../Footer/Footer';

const Popup: React.FC = () => {
 
  return (
    <div className={commonStyle.popup}>
      <SideBar/>
      <div className={commonStyle["main-content"]}>
        <Outlet/>
      </div>
    </div>
  );
};

export default Popup;
