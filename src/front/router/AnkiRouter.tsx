import { createHashRouter } from "react-router";
import HistoryPage from "../components/pages/History/HistoryPage";
import ConfigPage from "../components/pages/Config/ConfigPage";
import CustomPage from "../components/pages/Custom/CustomPage";
import ModifyCustomCard from "../components/pages/ModifyCustomCard/ModifyCustomCard";
import Main from "../pages/Main/Main";
import DetectPage from "../pages/Detect/DetectPage";

const router = createHashRouter([
  {
    path: '/',
    element: <Main/>,
    children: [
      {
        index: true,
        element: <DetectPage/>
      },
      {
        path: "card",
        element: <DetectPage/>
      },
      {
        path: "history",
        element: <HistoryPage/> 
      },
      {
        path: "custom",
        element: <CustomPage/>
      },
      {
        path: "config",
        element: <ConfigPage/>
      }
    ]
  },
  {
    path: '/modify-custom-card/:index?',
    element: <ModifyCustomCard/>
  }
]);

export default router;
