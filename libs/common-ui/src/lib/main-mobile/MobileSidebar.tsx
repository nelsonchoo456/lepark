import { useEffect, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { SCREEN_LG } from '../../config/breakpoints';

interface SidebarProps {
  children?: string | JSX.Element | JSX.Element[];
  className?: string;
}

export const MOBILE_SIDEBAR_WIDTH = '80px';

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

const SidebarContainer = styled.div<{
  open: boolean;
  customWidth?: string;
}>`

  width: ${({ open, customWidth }) =>
    customWidth ? customWidth : MOBILE_SIDEBAR_WIDTH};

  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;

  overflow: hidden;
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

export const MobileSidebar = ({ children, className  }: SidebarProps) => {
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
    <SidebarContainer open={open} className={`${className} p-4 bg-indigoGrey-100 h-100vh`}>
      <div>{children}</div>
    </SidebarContainer>
  );
};
