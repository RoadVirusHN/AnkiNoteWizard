import Tabs from '@/panel/components/Tabs/Tabs';
import mainStyle from "./main.module.css";
import { Outlet } from 'react-router';
import PathUpdater from '@/panel/utils/PathUpdater';
import { withErrorBoundary } from 'react-error-boundary';
import ErrorPage from '../Error/ErrorPage';

const Main = () => {
  // TODO : 맙소사, 각 페이지별 Padding 통일하기
  return (
    <div className={mainStyle.main}>
      <PathUpdater/>
      <Tabs/>
      <div className={mainStyle["main-content"]}>
        <Outlet/>
      </div>
    </div>
  );
};

export default withErrorBoundary(Main,
  {
    FallbackComponent: ErrorPage
  });