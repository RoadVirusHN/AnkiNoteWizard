import SimpleButton from "@/panel/components/Inputs/SimpleButton/SimpleButton";
import commonStyles from "./common.module.css";
import useLocale from "@/panel/hooks/useLocale";
import useContentUI from "./util/useContentUI";


const MyConfirm = () => {
  const {myConfirm: confirm} = useContentUI();
  const tl = useLocale('background');
  return <div className={commonStyles['my-confirm']} style={{display: confirm.isShowing ? 'block' : 'none'}}>
      <p>{confirm.text}</p>
      <div className={commonStyles.buttons}>
        <SimpleButton text={tl("OK")} onClick={confirm.onConfirm}/>
        <SimpleButton text={tl("Cancel")} onClick={confirm.onCancel}/>
      </div>
    </div>;
};
export default MyConfirm;