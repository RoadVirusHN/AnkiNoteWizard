import { Template } from "@/front/utils/useTemplates";
import templateDetailStyle from "./templateDetail.module.css";
import DownSvg from "@/public/Icon/Icon-Down.svg"
const TemplateDetail = ({template}:{template: Template}) => {
  return (<div className={templateDetailStyle.template}>
    <h2>{template.templateName}</h2>
    {template.meta.description}
    <DownSvg/>
  </div>);
};
export default TemplateDetail;