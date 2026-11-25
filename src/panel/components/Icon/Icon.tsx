import IconStyles from './Icon.module.css';
import {forwardRef} from 'react';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  url: string;
  handleClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
}


const Icon = forwardRef<HTMLDivElement,Props>(({url, handleClick, className, style, ...props}:Props, ref) => {
  return <div
    ref={ref}
    className={IconStyles.icon +' '+ className}
    style={{
      WebkitMaskImage: `url(${url})`,
      maskImage: `url(${url})`,
      ...style
    }}
    onClick={handleClick}
    {...props}
  />;
});
export default Icon;