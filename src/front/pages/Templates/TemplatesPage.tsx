import TemplateDetail from "@/front/components/pages/Templates/TemplateDetail/TemplateDetail";
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
    {templates.map((template)=><TemplateDetail template={template} />)}
  </div>);
};
export default TemplatesPage;