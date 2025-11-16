import useAnkiConnectionStore from "@/front/utils/useAnkiConnectionStore";
import { CardFieldDataType, CustomCard } from "@/front/utils/useCustomCard";
import useGlobalVarStore from "@/front/utils/useGlobalVarStore";
import detectPageStyle from "@/front/pages/Detect/detectPage.module.css";
import { Extracted } from "../DetectPage";

const DetectedCard = ({customCard, extracted}:{customCard: CustomCard, extracted: Extracted}) => {
  const {fetchAnki} = useAnkiConnectionStore();
  const {currentDeck} = useGlobalVarStore();
  const addToAnki = () => {
    const buildedFront = customCard.Front.html.replaceAll(/\{\{(.*?)\}\}/g, 
      (_, fieldName) => {
        const fieldInfo = customCard.Front.fields.find(f=>f.name === fieldName);
        if (fieldInfo) {
          switch (fieldInfo.dataType) {
            case CardFieldDataType.IMAGE:
              return `<img src="${extracted.Front[fieldName] || ''}" />`;
            case CardFieldDataType.AUDIO:
              return `[sound:${extracted.Front[fieldName] || ''}]`;
            case CardFieldDataType.TEXT:
              return extracted.Front[fieldName] || '';
            default:
              return extracted.Front[fieldName] || '';
          }
        }
        return ''; // Ensure a string is always returned
      });
    const buildedBack = customCard.Back.html.replaceAll(/\{\{(.*?)\}\}/g, 
      (_, fieldName) => {
        const fieldInfo = customCard.Back.fields.find(f=>f.name === fieldName);
        if (fieldInfo) {
          switch (fieldInfo.dataType) {
            case CardFieldDataType.IMAGE:
              return `<img src="${extracted.Back[fieldName] || ''}" />`;
            case CardFieldDataType.AUDIO:
              return `[sound:${extracted.Back[fieldName] || ''}]`;
            case CardFieldDataType.TEXT:
              return extracted.Back[fieldName] || '';
            default:
              return extracted.Back[fieldName] || '';
          }
        }
        return '';
      }
    );

    fetchAnki<{noteIds: number[]}>({
      action: 'addNote',
      params: {
        note: {
          deckName: currentDeck || 'Default',
          modelName: customCard.modelName || 'Basic',
          fields: {
            Front: buildedFront || 'Something Wrong with Front',
            Back:  buildedBack || 'Something Wrong with Back',
          },
          audio: customCard.audio ? [{
            url: customCard.audio.url,
            filename: customCard.audio.filename,
            skipHash: customCard.audio.skipHash,
            fields: customCard.audio.fields,
          }] : [],
          tags: customCard.tags || [],
        },
      },
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
        <div>{customCard.cardName}</div>
        <div className={detectPageStyle.detectedCardFields}>
          <span><b>Front:</b>  {extracted.Front['front']}</span>
          <span><b>Back:</b>  {extracted.Back['back']}</span>
        </div>
      </div>
      <div className={detectPageStyle.addCardButton} onClick={addToAnki}>⨁</div>
    </div>);
};
export default DetectedCard;