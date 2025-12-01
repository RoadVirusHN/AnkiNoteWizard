import TemplateDetail from "@/front/pages/Templates/TemplateDetail/TemplateDetail";
import useTemplate from "@/front/utils/useTemplates";
import AddIcon from "@/public/Icon/Icon-Add.svg";
import { useNavigate } from "react-router";

const TemplatesPage = ({}) => {
  const {templates} = useTemplate();  
  const navigate = useNavigate();
  return (<div>
    <AddIcon onClick={()=>{
      navigate("/modify");
    }}
    style={{cursor: "pointer"}}/>  
    {templates.map((template)=><TemplateDetail key={template.templateName} template={template} />)}
  </div>);
};
export default TemplatesPage;