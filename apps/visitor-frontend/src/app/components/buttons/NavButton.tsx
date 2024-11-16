import React, { ForwardedRef } from 'react';
import styles from './button.module.css';

interface ButtonProps {
  icon?: string | JSX.Element | JSX.Element[];
  children?: string | JSX.Element | JSX.Element[];
  className?: string;
  onClick?: () => void;
  iconClassname?: string;
  [key: string]: any;
}

export const NavButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ icon, children, className, onClick, iconClassname, ...fields }, ref) => {
    return (
      <button
      // flex-1 bg-green-50
        // style={{ height: "4rem" }}
        className={`flex flex-1 flex-col items-center cursor-pointer transition-all duration-200 rounded hover:text-green-500
          md:py-2 md:border-r md:hover:bg-green-50`}
        onClick={onClick}
        {...fields}
      >
        <div className={`h-14 w-14 rounded-full flex justify-center items-center text-3xl cursor-pointer
          text-green-400 font-semibold bg-green-50 hover:bg-green-100 transition-all duration-200
          md:h-10 md:bg-transparent md:hover:bg-transparent ${iconClassname ? iconClassname : ""}`}>
          {icon}
        </div>
        <div className='text-sm'>
          {children}
        </div>
      </button>
    );
  }
);