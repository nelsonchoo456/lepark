import styled from "styled-components";
import { SIDEBAR_WIDTH } from "./Sidebar";

interface ContentProps {
  $showSidebar: boolean;
}

export const Content = styled.div<ContentProps>`
  margin-left: ${({ $showSidebar }: ContentProps) =>
    $showSidebar ? SIDEBAR_WIDTH : '0'};
`;

// margin-left: ${({ $showSidebar }: ContentProps) =>
//   $showSidebar ? SIDEBAR_WIDTH : '0'};

export const ContentWrapper = styled.div`
  padding: 1rem; // p-4
`;