import { useState } from 'react';
import styled, { css } from 'styled-components';
import { fadeIn, fadeOut } from '../assets/animations';
// import { Logo } from './Logo';
import { ListItemType } from '../listMenu/ListMenu';
import { AiOutlineMenuFold, AiOutlineMenuUnfold } from 'react-icons/ai';
import { Menu } from 'antd';

interface SiderProps {
  children?: string | JSX.Element | JSX.Element[];
  items?: ListItemType[];
  showSidebar: boolean;
  activeKeys?: string[];
  className?: string;
}
interface StyledHeaderProps {
  $show: boolean;
}

const StyledHeader = styled.div<StyledHeaderProps>`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  border-bottom: 0.75px solid #f8f8f8;
  z-index: 999;

  & > :first-child:nth-last-child(1) {
    grid-column: 2;
    justify-self: center;
  }

  ${(props: StyledHeaderProps) =>
    props.$show
      ? css`
          animation: ${fadeIn} 0.3s forwards;
        `
      : css`
          animation: ${fadeOut} 0.3s forwards;
        `}
`;

const HeaderButton = styled.button`
  background-color: #f8f8f8;
  font-size: 1.25rem;
  width: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.3s;

  &:hover {
    background-color: #f8f8f8;
  }
`;

const TopCollapsible = styled.div<StyledHeaderProps>`
  position: absolute;
  width: 100vw;
  z-index: 99;

  ${(props) => !props.$show && 'display: none;'}

  ${(props) =>
    props.$show
      ? css`
          animation: ${fadeIn} 0.3s forwards;
        `
      : css`
          animation: ${fadeOut} 0.3s forwards;
        `}
`;

export const Header = ({
  children,
  items,
  showSidebar,
  activeKeys,
  className,
}: SiderProps) => {
  const [showHeaderSidebar, setShowHeaderSidebar] = useState<boolean>(false);

  const toggleHeaderSidebar = () => {
    setShowHeaderSidebar(!showHeaderSidebar);
  };

  return (
    !showSidebar && (
      <>
        <StyledHeader $show={!showSidebar} className="h-12 w-full bg-white">
          {items && <HeaderButton onClick={toggleHeaderSidebar}>
            {showHeaderSidebar ? (
              <AiOutlineMenuFold />
            ) : (
              <AiOutlineMenuUnfold />
            )}
          </HeaderButton>}
          {children}
        </StyledHeader>

        <TopCollapsible
          $show={showHeaderSidebar}
          className="bg-white shadow-lg rounded-b-xl pb-2"
        >
          <Menu items={items} style={{ backgroundColor: "transparent", border: "transparent" }}/>
        </TopCollapsible>
      </>
    )
  );
};

export default Header;
