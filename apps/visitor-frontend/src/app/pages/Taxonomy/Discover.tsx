import { ContentWrapper, Divider, LogoText } from "@lepark/common-ui";
import MainLayout from "../../components/main/MainLayout";
import { NavButton } from "../../components/buttons/NavButton";
import { PiPlantFill, PiStarFill, PiTicketFill } from "react-icons/pi";
import { FaTent } from "react-icons/fa6";
import { Badge, Card, Space } from "antd";
import { useNavigate } from 'react-router-dom'
import { speciesExamples } from "@lepark/data-utility";

const Discover = () => {
  const navigate = useNavigate();
  const cardStyle = "w-[95%] justify-center items-center text-left md:w-1/2 m-1 !p-0.01 flex flex-row";
  const speciesTitleStyle = "text-xl font-medium text-green-500";

  return (
    // <MainLayout>
      <div>
        {/* <div className="md:flex"> */}
          <Card
            size="small"
            style={{
              backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/6/63/Kallang_River_at_Bishan_Park.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: 'white',
              overflow: 'hidden'
            }}
            className="mb-2 w-full h-28 bg-green-400 rounded-2xl -z-10 md:w-full md:rounded md:h-64"
          >
            <div className="absolute top-0 left-0 w-full h-full p-4 bg-green-700/70 text-white flex">
              <div className="md:text-center md:mx-auto">
                <p className="font-medium">Bishan Park</p>
                <p className="font-medium text-2xl md:text-3xl">Discover</p>
              </div>
            </div>
            </Card>

<div className="justify-center bg-green-50">


          {/* md:flex-1 md:rounded-none md:mt-0 md:py-0 md:mb-2 md:flex-1 md:shadow-none */}
          <div className="flex flex-col items-center max-h-[calc(100vh-14rem)] overflow-y-auto no-scrollbar">
          <Card className={cardStyle} onClick={() => {
            navigate('/taxonomy/view-species');
          }}>
            <p>View 1 Species</p>
          </Card>
          {speciesExamples.map((species, index) => (
            <Card
              key={index}
              className={cardStyle}
              bodyStyle={{ padding: 10 }}
              onClick={() => {
                navigate(`/taxonomy/view-species/${species.id}`);
              }}
            >
                <div className="w-[15%] bg-green-800">

                </div>
                <div>
                    <h1 className={speciesTitleStyle}>{species.commonName}</h1>
                <p>{species.speciesName}</p>
                </div>

            </Card>
          ))}
          </div>
        {/* </div> */}

</div>

      </div>
    // </MainLayout>
  );
};

export default Discover;
