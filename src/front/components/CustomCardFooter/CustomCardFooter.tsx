import SimpleButton from "@/front/components/SimpleButton/SimpleButton";
import FlipSvg from "@/public/Flip-Vector.svg"
interface CustomCardFooterProps {
  onFlip: () => void;
}
const CustomCardFooter = ({onFlip}:CustomCardFooterProps) => {
  return (
  <footer >
    <div style={{position: 'absolute', display: 'flex', gap: '10px', alignItems: 'end', flexDirection: 'row', right: '10px'}}>
      <SimpleButton text="Flip" onClick={onFlip} svg={FlipSvg} />
      <SimpleButton text="Test" />
      <SimpleButton text="Modify" overridedStyle={{width: '50px', height: '30px', backgroundColor: 'var(--color-warning)', fontWeight: 'bold'}} />
    </div>
  </footer>);
};
export default CustomCardFooter;