import styled from "styled-components";
import { SIDEBAR_WIDTH } from "./Sidebar";
import { COLORS } from "../../config/colors";
import { SCREEN_LG } from "../../config/breakpoints";

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
  height: 100vh;
  overflow: scroll;

  @media (max-width: ${SCREEN_LG}px) {
    padding: 4rem 1rem 1rem 1rem;
  }
`;

export const DashboardContentWrapper = styled.div`
  padding: 0 1rem 1rem 1rem;
  min-height: 100vh;
  background-color: ${COLORS.gray[100]};
  // position: relative;
  // overflow: scroll;

  @media (max-width: ${SCREEN_LG}px) {
    padding: 4rem 1rem 1rem 1rem;
  }
`;


export const ContentWrapperDark = styled.div`
  padding: 1rem;
  background-color: ${COLORS.gray[100]};
  height: 100vh;
  overflow: scroll;

  @media (max-width: ${SCREEN_LG}px) {
    padding: 4rem 1rem 1rem 1rem;
  }
`;