import SimpleButton from "@/panel/components/Inputs/SimpleButton/SimpleButton";
import commonStyles from "./common.module.css";
import useLocale from "@/panel/hooks/useLocale";
import useContentUI from "./util/useContentUI";


const MyConfirm = () => {
  const {myConfirm} = useContentUI();
  const tl = useLocale('background');
  // WARN: MAKE SURE RETURN NULL AFTER HOOKS(useRef, useState, useEffect, etc) CALLED IN CONDITIONAL STATEMENT.
  if (!myConfirm.isShowing) return null;
  return <div className={commonStyles['my-confirm']}
    onClick={(e)=>{e.stopPropagation();}}
  >
      <p>{myConfirm.text}</p>
      <div className={commonStyles.buttons}>
        <SimpleButton text={tl("OK")} onMouseEnter={()=>{console.log("whyyyyyyyyyyyyy")}} onClick={myConfirm.onConfirm}/>
        <SimpleButton text={tl("Cancel")} onClick={myConfirm.onCancel}/>
      </div>
    </div>;
};
export default MyConfirm;