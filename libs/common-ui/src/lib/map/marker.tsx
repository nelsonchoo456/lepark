import styled from "styled-components";

interface CustomMarkerProps {
  $innerBackgroundColor?: string;
  $backgroundColor?: string;
  $circleWidth?: number;
  $online?: boolean;
}

export const CustomMarker = styled.div<CustomMarkerProps>`
  position: relative;
  width: ${({$circleWidth}) => $circleWidth ? $circleWidth + "px" : "30px"};
  height: ${({$circleWidth}) => $circleWidth ? $circleWidth + "px" : "30px"};
  background-color: ${({$backgroundColor}) => $backgroundColor ? $backgroundColor : "#007bff"};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 2px ${({$circleWidth}) => $circleWidth ? Math.round($circleWidth * 12 / 30) : 12}px 4px rgba(0, 0, 0, 0.1);

  &::before {
      content: '';
      position: absolute;
      bottom: -${({$circleWidth}) => $circleWidth ? Math.round($circleWidth * 10 / 30) + "px" : "10px"};
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: ${({$circleWidth}) => $circleWidth ? Math.round($circleWidth * 13 / 30) + "px" : "13px"} solid transparent;
      border-right: ${({$circleWidth}) => $circleWidth ? Math.round($circleWidth * 13 / 30) + "px" : "13px"} solid transparent;
      border-top: ${({$circleWidth}) => $circleWidth ? Math.round($circleWidth * 17 / 30) + "px" : "17px"} solid ${({$backgroundColor}) => $backgroundColor ? $backgroundColor : "#007bff"};
      
  }
`;

export const CustomMarkerInner = styled.div<CustomMarkerProps>`
  width: ${({$circleWidth}) => $circleWidth ?  Math.round($circleWidth * 22 / 30) + "px" : "22px"};
  height: ${({$circleWidth}) => $circleWidth ?  Math.round($circleWidth * 22 / 30) + "px" : "22px"};
  display: flex;
  align-items: center;
  justify-content: center;
  // background-color: ${({$backgroundColor}) => $backgroundColor ? $backgroundColor : "#007bff"};
  background-color: white;
  border-radius: 50%;
  z-index: 1;
`;

export const HtmlPictureMarker = styled.div<CustomMarkerProps>`
  position: relative;
  width: ${({$circleWidth}) => $circleWidth ? $circleWidth + "px" : "30px"};
  height: ${({$circleWidth}) => $circleWidth ? $circleWidth + "px" : "30px"};
  background-color: ${({$backgroundColor}) => $backgroundColor ? $backgroundColor : "#007bff"};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 2px ${({$circleWidth}) => $circleWidth ? Math.round($circleWidth * 12 / 30) : 12}px 4px rgba(0, 0, 0, 0.1);

  &::before {
      content: '';
      position: absolute;
      bottom: -${({$circleWidth}) => $circleWidth ? Math.round($circleWidth * 10 / 30) + "px" : "10px"};
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: ${({$circleWidth}) => $circleWidth ? Math.round($circleWidth * 13 / 30) + "px" : "13px"} solid transparent;
      border-right: ${({$circleWidth}) => $circleWidth ? Math.round($circleWidth * 13 / 30) + "px" : "13px"} solid transparent;
      border-top: ${({$circleWidth}) => $circleWidth ? Math.round($circleWidth * 17 / 30) + "px" : "17px"} solid ${({$backgroundColor}) => $backgroundColor ? $backgroundColor : "#007bff"};
      
  }
`;

export const HtmlPictureMarkerGlow = styled.div<CustomMarkerProps>`
  width: ${({$circleWidth}) => $circleWidth ? $circleWidth + "px" : "30px"};
  height: ${({$circleWidth}) => $circleWidth ? $circleWidth + "px" : "30px"};
  border-radius: 100px;
  box-shadow: 0px 0px 1rem 1rem #d4f4cc80};
`;

export const InnerPictureMarkerGlow = styled.div<CustomMarkerProps>`
  width: ${({$circleWidth}) => $circleWidth ? Math.round($circleWidth * 22 / 30) + "px" : "30px"};
  height: ${({$circleWidth}) => $circleWidth ? Math.round($circleWidth * 22 / 30) + "px" : "30px"};
  border-radius: 100px;
  box-shadow: 0px 0px 0.8rem 0.8rem #d4f4cc80};
`;


export const PictureMarkerInner = styled.div<CustomMarkerProps>`
  width: ${({$circleWidth}) => $circleWidth ?  Math.round($circleWidth * 22 / 30) + "px" : "22px"};
  height: ${({$circleWidth}) => $circleWidth ?  Math.round($circleWidth * 22 / 30) + "px" : "22px"};
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({$innerBackgroundColor}) => $innerBackgroundColor ? $innerBackgroundColor : "white"};
  // background-color: white;
  border-radius: 50%;
  z-index: 1;
`;

// export const HtmlPictureMarker = styled.div<CustomMarkerProps>`
//   position: relative;
//   width: ${({circleWidth}) => circleWidth ? circleWidth + "px" : "40px"};
//   height: ${({circleWidth}) => circleWidth ? circleWidth + "px" : "40px"};
//   // background-color: ${({backgroundColor}) => backgroundColor ? backgroundColor : "#007bff"};
//   border-radius: 50%;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   // box-shadow: 2px ${({circleWidth}) => circleWidth ? Math.round(circleWidth * 12 / 30) : 12}px 4px rgba(0, 0, 0, 0.1);

//   &::before {
//       content: '';
//       position: absolute;
//       bottom: -${({circleWidth}) => circleWidth ? Math.round(circleWidth * 8 / 30) + "px" : "10px"};
//       left: 50%;
//       transform: translateX(-50%);
//       width: 0;
//       height: 0;
//       border-left: ${({circleWidth}) => circleWidth ? Math.round(circleWidth * 8 / 30) + "px" : "8px"} solid transparent;
//       border-right: ${({circleWidth}) => circleWidth ? Math.round(circleWidth * 8 / 30) + "px" : "8px"} solid transparent;
//       border-top: ${({circleWidth}) => circleWidth ? Math.round(circleWidth * 8 / 30) + "px" : "10px"} solid ${({backgroundColor}) => backgroundColor ? backgroundColor : "#007bff"};
      
//   }
// `;

// export const PictureMarkerInner = styled.div<CustomMarkerProps>`
//   width: ${({circleWidth}) => circleWidth ?  Math.round(circleWidth * 26 / 30) + "px" : "30px"};
//   height: ${({circleWidth}) => circleWidth ?  Math.round(circleWidth * 26 / 30) + "px" : "30px"};
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   // background-color: ${({backgroundColor}) => backgroundColor ? backgroundColor : "#007bff"};
//   background-color: white;
//   border-radius: 50%;
//   z-index: 1;
// `;