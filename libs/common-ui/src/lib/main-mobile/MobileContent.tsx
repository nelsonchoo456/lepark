import styled from "styled-components";
import { MOBILE_SIDEBAR_WIDTH } from "./MobileSidebar";

interface ContentProps {
  $showSidebar: boolean;
}

export const MobileContent = styled.div<ContentProps>`
  margin-left: ${({ $showSidebar }: ContentProps) =>
    $showSidebar ? MOBILE_SIDEBAR_WIDTH : '0'};
`;

// margin-left: ${({ $showSidebar }: ContentProps) =>
//   $showSidebar ? SIDEBAR_WIDTH : '0'};

export const MobileContentWrapper = styled.div`
  padding: 1rem; // p-4
`;