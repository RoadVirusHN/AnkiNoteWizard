import commonStyle from '@/front/common.module.css';
import useAnkiConnectionStore from '@/front/utils/useAnkiConnectionStore';
import useGlobalVarStore from '@/front/utils/useGlobalVarStore';
import { useRef } from 'react';

const CardPage: React.FC = () => {
  const frontRef = useRef<HTMLTextAreaElement>(null);
  const backRef = useRef<HTMLTextAreaElement>(null);
  const {fetchAnki} = useAnkiConnectionStore();
  const {currentDeck} = useGlobalVarStore();
  const addToAnki = () => {
    fetchAnki<{noteIds: number[]}>({
      action: 'addNote',
      params: {
        note: {
          deckName: currentDeck || 'Default',
          modelName: 'Basic',
          fields: {
            Front: frontRef.current?.value || 'Sample Front',
            Back:  backRef.current?.value || 'Sample Back',
          },
          options: {
            allowDuplicate: false,
          },
          tags: ['anki-card-wizard'],
        },
      },
    }).then((res) => {
      if (res.error) {
        console.error('Error adding note to Anki:', res.error);
        alert('Failed to add note to Anki: ' + res.error);
      } else {
        console.log('Note added to Anki with IDs:', res.result?.noteIds);
        alert('Note added to Anki successfully!');
      }
    });
  };  

  return (
    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px'}}>
      <textarea ref={frontRef} placeholder="Front"/>
      <textarea ref={backRef} placeholder="Back"/>
      <button onClick={()=>addToAnki()}>add</button>
    </div>
  );
};

export default CardPage;
