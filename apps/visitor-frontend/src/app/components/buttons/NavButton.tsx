import React, { ForwardedRef } from 'react';
import styles from './button.module.css';

interface ButtonProps {
  icon?: string | JSX.Element | JSX.Element[];
  children?: string | JSX.Element | JSX.Element[];
  className?: string;
  onClick?: () => void;
  [key: string]: any;
}

export const NavButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ icon, children, className, onClick, ...fields }, ref) => {
    return (
      <button
      // flex-1 bg-green-50
        // style={{ height: "4rem" }}
        className={`flex flex-col items-center cursor-pointer transition-all duration-200 md:p-2 flex-1 md:bg-green-100`}
        onClick={onClick}
        {...fields}
      >
        <div className={`h-14 w-14 md:h-12 md:w-full rounded-full md:rounded flex justify-center items-center text-3xl cursor-pointer ${className} transition-all duration-200`}>
          {icon}
        </div>
        <div className="font-medium">
          {children}
        </div>
      </button>
    );
  }
);