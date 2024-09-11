import { ContentWrapper, Divider, LogoText } from "@lepark/common-ui";
import MainLayout from "../../components/main/MainLayout";
import { NavButton } from "../../components/buttons/NavButton";
import { PiPlantFill, PiStarFill, PiTicketFill } from "react-icons/pi";
import { FaTent } from "react-icons/fa6";
import { Badge, Card, Space } from "antd";
import { useNavigate, useLocation } from 'react-router-dom'
import { speciesExamples } from "@lepark/data-utility";
import { useState, useEffect } from 'react';
import { getAllSpecies, SpeciesResponse } from '@lepark/data-access';

const Discover = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const cardStyle = "w-[95%] text-left md:w-1/2 m-1 !p-0.01 inline-flex items-center";
  const speciesTitleStyle = "text-xl font-medium text-green-500";
  const [loading, setLoading] = useState(false);
  const [fetchedSpecies, setFetchedSpecies] = useState<SpeciesResponse[]>([]);

  useEffect(() => {
    const fetchSpecies = async () => {
      setLoading(true);
      try {
        const species = await getAllSpecies();
        setFetchedSpecies(species.data);
        console.log('fetched species', species.data);
      } catch (error) {
        console.error('Error fetching species:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecies();
  }, []);

  const navigateToSpecies = (speciesId: string) => {
    navigate(`/discover/${speciesId}`);
  };

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
          {fetchedSpecies.map((species, index) => (
            <Card
              key={index}
              className={cardStyle}
              bodyStyle={{ padding: 10 }}
              onClick={() => navigateToSpecies(species.id)}
            >
              <div className="flex flex-row items-center">
                <div className="w-[60px] h-[60px] flex-shrink-0 mr-2 overflow-hidden rounded">
                  <img
                    src="https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQLDJn8tSD57Z5Wy8t3nFbaiEG52OP0fK1lTXOckm1CuzNTGrR0"
                    alt={species.commonName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="pl-1">
                  <h2 className={speciesTitleStyle}>{species.commonName}</h2>
                  <p>{species.speciesName}</p>
                </div>
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
