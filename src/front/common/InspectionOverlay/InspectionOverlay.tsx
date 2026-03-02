import SimpleButton from "../SimpleButton/SimpleButton";
import { InspectionMode } from "@/scripts/content/tagExtraction";
import inspectionOverlayStyle from "./InspectionOverlay.module.css";
import useLocale from "@/front/utils/useLocale";

const InspectionOverlay = ({mode, cancleInspectionMode}:{ mode: InspectionMode, cancleInspectionMode:()=>void}) => {
  const tl = useLocale('component.InspectionOverlay');
  return <>
    <div className={inspectionOverlayStyle.overlay} onClick={cancleInspectionMode}>  
      <div className={inspectionOverlayStyle['instruction-box']}>
        <span className={inspectionOverlayStyle['left-pointer']}>◀</span>
        <span className={inspectionOverlayStyle['left-pointer']}>◀</span>
        <span className={inspectionOverlayStyle['left-pointer']}>◀</span>
        <span className={inspectionOverlayStyle['left-pointer']}>◀</span>
        {
          mode==InspectionMode.TEXT_EXTRACTION ?(<>
            <h1>{tl('Text Extraction Mode')}</h1>
            <ol>
                <li>{tl('Hover over the text')}</li>
                <li>{tl('Click to copy into your clipboard')}</li>
                <li>{tl('Paste the text where you want!')}</li>
            </ol></>) : (<>
              <h1>{tl('Tag Inspection Mode')}</h1>
              <ol>
                  <li>{tl('Hover over the tag')}</li>
                  <li>{tl('Click to pop up the menu')}
                    <ul>
                      <li>{tl('Extract text copy the text Content')}</li>
                      <li>{tl('Extract Selector copy the CSS Selector')}</li>
                      <li>{tl('Select Children change taget tag to a child')}</li>
                    </ul>
                  </li>
                  <li>{tl('Click to copy into your clipboard')}</li>
                  <li>{tl('Paste the text where you want!')}</li>
              </ol>
            </>)
        }
        <h2>* {tl('Click here to exit mode')}</h2> 
        <span className={inspectionOverlayStyle['left-pointer']}>◀</span>
        <span className={inspectionOverlayStyle['left-pointer']}>◀</span>
        <span className={inspectionOverlayStyle['left-pointer']}>◀</span>
        <span className={inspectionOverlayStyle['left-pointer']}>◀</span>
      </div>
     </div>
  </> ;
};
export default InspectionOverlay;