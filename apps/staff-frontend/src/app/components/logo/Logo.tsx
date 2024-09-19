import parkLogo from '../../assets/park.png';

interface LogoInterface {
  size?: number;
}

const Logo = ({ size }: LogoInterface) => {
  return <img src={parkLogo} alt="Lepark Logo" style={{ width: `${size || 2}rem`, height: `${size || 2}rem` }}/>
}

export default Logo;