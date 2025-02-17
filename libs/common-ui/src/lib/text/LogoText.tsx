interface LogoProps {
  children?: string | JSX.Element | JSX.Element[];
  className?: string;
  size?: string;
  [key: string]: any;
}

export const LogoText = ({ children, className, size, ...fields }: LogoProps) => {
  return (
    <div
      className={`${className} bg-gradient-to-r from-green-500 via-green-700 to-green-400 inline-block logo text-transparent bg-clip-text font-semibold 
          border-b-green-400
          ${size === 'lg' ? 'text-2xl' : ''}
        `}
      {...fields}
    >
      {children}
    </div>
  );
};