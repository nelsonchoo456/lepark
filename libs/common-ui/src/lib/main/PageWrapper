import React, { ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children, className = '', style = {} }) => {
  return (
    <div
      className={`h-screen w-[calc(100vw-var(--sidebar-width))] overflow-auto ${className}`}
      style={{
        zIndex: 1,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default PageWrapper;

// IF YOU NEED THESE CHARACTERISTICS, USE THIS CONTAINER:
/* Is as tall as the screen
Is as wide as the screen minus the width of a sidebar
Will scroll if its content overflows */
