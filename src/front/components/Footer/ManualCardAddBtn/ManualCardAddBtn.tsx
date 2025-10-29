import AddAnkiBtnSvg from '@/public/AddAnkiBtn-Svg.svg';
const ManualCardAddBtn = ({}) => {
  return (<div style={{position: 'relative'}}>
    <button style={{ all: 'unset', cursor: 'pointer' }} title="Add Card to Anki Manually" onClick={() => {}}>
      <AddAnkiBtnSvg width={40} height={40} style={{ position: 'fixed',bottom: '1px', right: '5px', filter: 'drop-shadow(3px 3px 2px #333)' }}/>
    </button>
  </div>);
};
export default ManualCardAddBtn;