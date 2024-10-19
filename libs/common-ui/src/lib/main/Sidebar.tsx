import { useEffect, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { SCREEN_LG } from '../../config/breakpoints';

interface SidebarProps {
  children?: string | JSX.Element | JSX.Element[];
  className?: string;
}

export const SIDEBAR_WIDTH = '250px';

// Keyframes for sliding in and out
const slideIn = keyframes`
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
`;
// const slideIn = keyframes`
//   from {
//     opacity: 0;
//     width: 0;
//   }
//   to {
//     opacity: 1;
//     width: ${SIDEBAR_WIDTH};
//   }
// `;

// const slideOut = keyframes`
//   from {
//     opacity: 0;
//     width: ${SIDEBAR_WIDTH};
//   }
//   to {
//     opacity: 1;
//     width: 0;
//   }
// `;

const SidebarContainer = styled.div<{
  open: boolean;
  customWidth?: string;
}>`

  width: ${({ open, customWidth }) =>
    customWidth ? customWidth : SIDEBAR_WIDTH};

  height: 100%;
  position: fixed;
  top: 0;
  left: 0;

  overflow-x: hidden;
  overflow-y: auto;
  z-index: 40;

  ${({ open }) =>
    open
      ? css`
          animation: ${slideIn} 0.3s forwards;
        `
      : css`
          animation: ${slideOut} 0.3s forwards;
        `}
`;
// width: ${({ open, customWidth }) =>
//   open ? (customWidth ? customWidth : SIDEBAR_WIDTH) : '0'};
// transition: width 0.3s ease-in-out, height 0.3s ease-in-out;

export const Sidebar = ({ children, className  }: SidebarProps) => {
  const [open, setOpen] = useState<boolean>(window.innerWidth >= SCREEN_LG);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= SCREEN_LG) {
        setOpen(true);
      } else {
        setOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <SidebarContainer open={open} className={`${className} py-4 bg-indigoGrey-100`}>
      <div>{children}</div>
    </SidebarContainer>
  );
};
