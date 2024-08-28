interface LogoProps {
  children?: string;
  className?: string;
  size?: string;
}

export const LogoText = ({ children, className, size }: LogoProps) => {
  return (
    <div
      className={`bg-gradient-to-r from-green-500 via-green-700 to-green-400 inline-block logo text-transparent bg-clip-text font-semibold ${
        size === 'lg' ? 'text-2xl' : ''
      }`}
    >
      {children}
    </div>
  );
};