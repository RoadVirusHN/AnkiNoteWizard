import { createHashRouter } from "react-router";
import HistoryPage from "../pages/History/HistoryPage";
import ConfigPage from "../pages/Config/ConfigPage";
import ModifyTemplate from "../pages/ModifyTemplate/ModifyTemplate";
import Main from "../pages/Main/Main";
import DetectPage from "../pages/Detect/DetectPage";
import AddPage from "../pages/Add/AddPage";
import TemplatesPage from "../pages/Templates/TemplatesPage";

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
        path: "detect",
        element: <DetectPage/>
      },
      {
        path: "add",
        element: <AddPage/>
      },
      {
        path: "history",
        element: <HistoryPage/> 
      },
      {
        path: "templates",
        element: <TemplatesPage/>
      },
      {
        path: "config",
        element: <ConfigPage/>
      },
      {
        path: "modify",
        element: <ModifyTemplate/>
      }
    ]
  }
]);

export default router;
