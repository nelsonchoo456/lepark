import styled, { css } from 'styled-components';
import { bottomFadeIn, bottomFadeOut, ListItemType } from '@lepark/common-ui';

interface StyledHeaderProps {
  $show: boolean;
}

const StyledBottomBar = styled.div<StyledHeaderProps>`
  position: fixed;
  bottom: 0;
  border-top: 0.75px solid #f8f8f8;
  z-index: 999;
  width: 100%;
  ${(props: StyledHeaderProps) =>
    props.$show
      ? css`
          animation: ${bottomFadeIn} 0.3s forwards;
        `
      : css`
          animation: ${bottomFadeOut} 0.3s forwards;
        `}
`;

const TabsList = styled.div`
  display: flex;
  background-color: white;
  width: 100%;
`;


interface TabTriggerProps {
  active: boolean;
}


interface BottomNavBarProps {
  items: ListItemType[];
  activeKeys?: string[];
  showSidebar: boolean;
  onTabClick?: (key: string) => void;
}

export const BottomNavBar = ({ items, activeKeys, showSidebar, onTabClick }: BottomNavBarProps) => {
  return (
    !showSidebar && (
      <StyledBottomBar $show={!showSidebar}>
        <TabsList>
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => item.onClick && item.onClick()}
              className="flex-1 py-1 text-center flex flex-col items-center hover:text-green-200 transition-all duration-300"
            >
              <div className="p-1 rounded-full hover:bg-green-200 hover:text-white transition-all duration-300 ease-out hover:scale-110" >
                {item.icon}
              </div>
              <div className="" >
                  {item.label}
                </div>
            </button>
          ))}
        </TabsList>
      </StyledBottomBar>
    )
  );
};


