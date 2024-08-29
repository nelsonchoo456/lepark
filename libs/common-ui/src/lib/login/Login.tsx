import styled from 'styled-components';
import { SCREEN_LG, SCREEN_2XL } from '../../config/breakpoints';
import { COLORS } from '../../config/colors';

export const LoginLayout = styled.div`
  display: flex;
  flex-direction: row-reverse;
  height: 100vh;
  max-width: ${SCREEN_2XL}px;

  margin-left: auto;
  margin-right: auto;

  @media (max-width: ${SCREEN_LG}px) {
    display: inline;
  }
`;

export const LoginPanel = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  box-sizing: border-box;


  @media (max-width: ${SCREEN_LG}px) {
    height: 90vh;
  }
`;

export const AnnouncementsPanel = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  box-sizing: border-box;
  background-color: transparent; /* Example background */

  @media (max-width: ${SCREEN_LG}px) {
    background-color: #f0f0f0;
  }
`;

export const AnnouncementsCard = styled(LoginPanel)`
  background-color: ${COLORS.indigo[100]};
  height: 100%;
  border-radius: 0.5rem;
  flex-direction: column;
  align-items: start;
  justify-content: start;

  @media (max-width: ${SCREEN_LG}px) {
    background-color: transparent;
  }
`;
