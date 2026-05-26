import SimpleButton from "@/panel/components/Inputs/SimpleButton/SimpleButton";
import commonStyles from "./common.module.css";
import useContentUI from "./util/useContentUI";
import { useTranslation } from "react-i18next";


const MyConfirm = () => {
  const {myConfirm} = useContentUI();
  const {t} = useTranslation('common');
  // WARN: MAKE SURE RETURN NULL AFTER HOOKS(useRef, useState, useEffect, etc) CALLED IN CONDITIONAL STATEMENT.
  if (!myConfirm.isShowing) return null;
  return <div className={commonStyles['my-confirm']}
    onClick={(e)=>{e.stopPropagation();}}
  >
      <p>{myConfirm.text}</p>
      <div className={commonStyles.buttons}>
        <SimpleButton text={t("ok")} onClick={myConfirm.onConfirm}/>
        <SimpleButton text={t("cancel")} onClick={myConfirm.onCancel}/>
      </div>
    </div>;
};
export default MyConfirm;