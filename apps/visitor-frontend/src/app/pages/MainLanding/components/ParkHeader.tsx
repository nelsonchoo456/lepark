import { Card } from "antd"
import { useNavigate } from "react-router-dom"
import { usePark } from "../../../park-context/ParkContext";

interface ParkHeaderProps {
  children?: string | JSX.Element | JSX.Element[];
  cardClassName?: string;
}
const ParkHeader = ({ children, cardClassName }: ParkHeaderProps) => {
  const navigate = useNavigate();
  const { selectedPark } = usePark();
  return (
    <Card
        size="small"
        style={{
          backgroundImage: `url('${selectedPark?.images && selectedPark.images.length > 0 ? selectedPark.images[0] : 'https://upload.wikimedia.org/wikipedia/commons/6/63/Kallang_River_at_Bishan_Park.jpg'}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
        className={`${cardClassName} mb-2 w-full h-28 bg-green-400 rounded-2xl cursor-pointer md:w-full md:rounded md:h-48`}
        onClick={() => navigate('/select-park')}
      >
        <div className="absolute top-0 left-0 w-full h-full p-4 bg-green-700/70 text-white flex cursor-pointer gap-2">
          {children}
        </div>
      </Card>
  )
}

export default ParkHeader;