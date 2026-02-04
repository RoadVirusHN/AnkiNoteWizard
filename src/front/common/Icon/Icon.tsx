interface Props extends React.HTMLAttributes<HTMLDivElement> {
  url: string;
  handleClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
}


const Icon = ({url, handleClick, className, style, ...props}:Props) => {
  return <div
    className={className}
    style={{
      width: '24px',
      height: '24px',
      backgroundColor: 'var(--color-primary)',
      WebkitMaskImage: `url(${url})`,
      maskImage: `url(${url})`,
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
      WebkitMaskSize: 'contain',
      maskSize: 'contain',
      ...style
    }}
    onClick={handleClick}
    {...props}
  />;
};
export default Icon;