import parkLogo from '../assets/park.png';

interface LogoInterface {
  size?: number;
}

export const Logo = ({ size }: LogoInterface) => {
  return <img src={parkLogo} alt="Leparks Logo" style={{ width: `${size || 2}rem`, height: `${size || 2}rem` }}/>
}