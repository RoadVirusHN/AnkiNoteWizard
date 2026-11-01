import IconStyles from './Icon.module.css';
interface Props extends React.HTMLAttributes<HTMLDivElement> {
  url: string;
  handleClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
}


const Icon = ({url, handleClick, className, style, ...props}:Props) => {
  return <div
    className={IconStyles.icon +' '+ className}
    style={{
      WebkitMaskImage: `url(${url})`,
      maskImage: `url(${url})`,
      ...style
    }}
    onClick={handleClick}
    {...props}
  />;
};
export default Icon;