import scanRuleDetailStyle from "./scanRuleDetail.module.css";
import ModifySvg from "@/public/Icon/Icon-Modify.svg";
// TODO : Add Link Icon
import LinkSvg from "@/public/Icon/Icon-Filter.svg";
import { useNavigate } from "react-router";
import { ScanRule } from "@/types/scanRule.types";
import Tags from "@/panel/components/Tags/Tags";
import useAnkiConnectionStore from "@/panel/stores/useAnkiConnectionStore";
import { useTranslation } from "react-i18next";
const ScanRuleDetail = ({scanRule, idx, onCheck}:{scanRule: ScanRule, idx: string, onCheck: (e: React.MouseEvent<HTMLInputElement>) => void}) => {
  const navigate = useNavigate();
  // TODO : Add Link Functionality
  // TODO : Configurable elipsis for title and description by font size.
  const {t} = useTranslation('page',{keyPrefix: 'scanRulesPage'});
  const {t:tCommon} = useTranslation('common'); 
  const {models} = useAnkiConnectionStore();
  const isContainModel = models[scanRule.modelId]!==null;
  return (<div className={scanRuleDetailStyle.scanRule}>
    <div className={scanRuleDetailStyle.main}>
      <div className={scanRuleDetailStyle.meta}>
        <div className={scanRuleDetailStyle.title}>
          <h2>{scanRule.scanRuleName}</h2>
          <p>
            {scanRule.meta.author ? <p>by {scanRule.meta.author}</p> : null}
          </p>
        </div>
      </div>
      <div className={scanRuleDetailStyle.description}>
        {scanRule.meta.description?.slice(0,135)}{scanRule.meta.description && scanRule.meta.description.length > 135 ? '...' : ''}
      </div>
      <div className={scanRuleDetailStyle.info}>
        {isContainModel ? 
          <p>Model: {models[scanRule.modelId].name.slice(0,30)}{scanRule.modelId.length>30? "...":""}</p>:
          <p style={{color:'var(--color-danger)'}} title={tCommon('checkAnkiConnection')}>
            {t('noSuchAModel|model|', {model: scanRule.modelId})}</p>
        }
        <Tags givenTagIds={scanRule.tagIds.slice(0,4)} />
      </div>
    </div> 
    <div className={scanRuleDetailStyle.buttonGroup}>
        <input type="checkbox" onClick={onCheck}/>
        <img src={ModifySvg} onClick={()=>{
          navigate(`/scanRules/modify/${idx}`);
        }}/>      
        {/* TODO : Scanrule Link 기능 */}
        <img src={LinkSvg} onClick={()=>{}}/>
    </div>
  </div>);
};
export default ScanRuleDetail;