import { createMemoryRouter } from "react-router";
import ConfigPage from "../pages/Config/ConfigPage";
import ModifyTemplate from "../pages/ModifyTemplate/ModifyTemplate";
import Main from "../pages/Main/Main";
import DetectPage from "../pages/Detect/DetectPage";
import AddPage from "../pages/Add/AddPage";
import TemplatesPage from "../pages/Templates/TemplatesPage";
import PreviewCard from '../pages/PreviewCard/PreviewCard';
import ErrorPage from "../pages/Error/ErrorPage";

const router = (currentUrl: string)=> createMemoryRouter([
  {
    path: '/',
    element: <Main/>,
    ErrorBoundary: ErrorPage,
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
        path: "templates",
        element: <TemplatesPage/>
      },
      {
        path: "config",
        element: <ConfigPage/>
      },
      {
        path: "templates/modify/:index?",
        element: <ModifyTemplate/>
      },
      {
        path: "previewCard/:index",
        element: <PreviewCard/>
      }
    ],
  },
], {initialEntries: [currentUrl]});

export default router;
