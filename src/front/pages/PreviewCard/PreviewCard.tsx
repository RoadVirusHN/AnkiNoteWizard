import useTemplate from "@/front/utils/useTemplates";
import { useParams } from "react-router";

const PreviewCard = ({}) => {
  const {index} = useParams();
  const {notes} = useTemplate();
  return (<div>
    {index}
    {notes[index ?? '0-0'].fields.Front}
  </div>);
};
export default PreviewCard;