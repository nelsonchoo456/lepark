interface DividerProps {
  children?: string | JSX.Element | JSX.Element[];
  className?: string;
}

export const Divider = ({ children, className }: DividerProps) => {
  return (
    <div className={`flex items-center w-full ${className}`}>
      {children && (
        <>
          <div className="bg-slate-300 w-3 mr-2 h-px"></div>
          <div className="mr-2">{children}</div>
        </>
      )}
      <div className="bg-slate-300 grow h-px"></div>
    </div>
  );
};
