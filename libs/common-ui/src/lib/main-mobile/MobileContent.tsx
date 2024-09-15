import styled from "styled-components";
import { MOBILE_SIDEBAR_WIDTH } from "./MobileSidebar";

interface ContentProps {
  $showSidebar: boolean;
}

export const MobileContent = styled.div<ContentProps>`
  margin-left: ${({ $showSidebar }: ContentProps) =>
    $showSidebar ? MOBILE_SIDEBAR_WIDTH : '0'};
  padding-top: ${({ $showSidebar }: ContentProps) =>
    $showSidebar ? '0' : '2.8rem'};
  padding-bottom: ${({ $showSidebar }: ContentProps) =>
    $showSidebar ? '0' : '64px'};

  height: 100vh;
  overflow-y: auto;
`;

// margin-left: ${({ $showSidebar }: ContentProps) =>
//   $showSidebar ? SIDEBAR_WIDTH : '0'};

export const MobileContentWrapper = styled.div`
  padding: 1rem; // p-4
`;