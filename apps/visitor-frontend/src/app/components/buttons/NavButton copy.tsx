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
        className={`flex flex-col items-center cursor-pointer transition-all duration-200 rounded hover:text-green-500 
          md:p-2 flex-1 md:bg-highlightGreen-100 md:hover:bg-green-100 md:flex-row`}
        onClick={onClick}
        {...fields}
      >
        <div className={`h-14 w-14 rounded-full flex justify-center items-center text-3xl cursor-pointer
          text-highlightGreen-400 font-semibold bg-highlightGreen-100 hover:bg-green-100 transition-all duration-200
          md:h-12 md:w-full md:bg-transparent md:rounded `}>
          {icon}
        </div>
        <div className='text-sm'>
          {children}
        </div>
      </button>
    );
  }
);