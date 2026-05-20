import { InspectionMode } from "@/types/app.types";
import MultiHighlight from "./MultiHighlight";
import Menu from "./Menu";
import Tooltip from "./Tooltip";
import MyConfirm from "./MyConfirm";
import { useContentScenario } from "./util/useContentSceneario";
import TagHighlight from "./TagHighlight";
import { useEffect } from "react";

const App = ({mode, port, roots, deactivate}:{mode:InspectionMode, port:chrome.runtime.Port, roots:HTMLElement[], deactivate:()=>void}) => {
  useContentScenario({mode, port, roots, deactivate});
  return <>
    <TagHighlight/>
    <MultiHighlight />;
    <Menu />
    <Tooltip/>
    <MyConfirm/>
  </>;
};
export default App;