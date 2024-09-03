import styled from "styled-components";
import { SIDEBAR_WIDTH } from "./Sidebar";
import { COLORS } from "../../config/colors";

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
  padding: 1rem;
  height: 100%;
  height: 100vh;
`;


export const ContentWrapperDark = styled.div`
  padding: 1rem;
  background-color: ${COLORS.gray[100]};
  height: 100vh;
`;