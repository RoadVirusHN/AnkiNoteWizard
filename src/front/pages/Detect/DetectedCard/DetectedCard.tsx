import useAnkiConnectionStore from "@/front/utils/useAnkiConnectionStore";
import { Note } from "@/front/utils/useTemplates";
import detectPageStyle from "@/front/pages/Detect/detectPage.module.css";
import { Extracted } from "../DetectPage";

interface DetectedCardProps {
  key: string;
  checkAdd: (val:boolean)=>void;
  note: Note;
  extracted: Extracted;
  onChange: (newNote: Note)=>void;
};

const DetectedCard = ({key, checkAdd, note, extracted, onChange}:DetectedCardProps) => {
  const {fetchAnki} = useAnkiConnectionStore();  
  const addToAnki = () => {
    fetchAnki<{noteIds: number[]}>({
      action: 'addNote',
      params: { note },
    }).then((res) => {
      if (res.error) {
        console.error('Error adding note to Anki:', res.error);
        alert('Failed to add note to Anki: ' + res.error);
      } else {
        console.log('Note added to Anki with ID:', res.result);
        alert('Note added to Anki successfully!');
      }
    });
  };  
  return (  
    <div className={detectPageStyle.detectedCardContainer}>
      <div className={detectPageStyle.detectedCardContent}>
        <input type="checkbox" onChange={e=>{checkAdd(e.target.checked)}}/>
        <div>{note.modelName}</div>
        <div className={detectPageStyle.detectedCardFields}>
          <span><b>Front:</b>  {extracted.Front['front']}</span>
          <span><b>Back:</b>  {extracted.Back['back']}</span>
        </div>
      </div>
      <div className={detectPageStyle.addCardButton} onClick={addToAnki}>⨁</div>
    </div>);
};
export default DetectedCard;