import TemplateDetail from "@/front/components/pages/Templates/TemplateDetail/TemplateDetail";
import useTemplate from "@/front/utils/useTemplates";

const TemplatesPage = ({}) => {
  const {templates} = useTemplate();  
  const openAddCustomCardModal = () => {
    console.log("openAddCardModal");
    chrome.runtime.sendMessage({type: 'OPEN_MODIFY_CUSTOM_CARD_MODAL'});
  }
  return (<div>
      <div onClick={openAddCustomCardModal} style={{cursor: 'pointer'}}>⨁</div>
      {templates.map((template)=><TemplateDetail template={template} />)}
    </div>);
};
export default TemplatesPage;