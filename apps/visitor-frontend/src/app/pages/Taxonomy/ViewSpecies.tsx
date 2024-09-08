import React, { useState, useEffect } from 'react';
import { ContentWrapper, Divider, LogoText, CustButton } from "@lepark/common-ui";
import MainLayout from "../../components/main/MainLayout";
import { NavButton } from "../../components/buttons/NavButton";
import { PiPlantFill, PiStarFill, PiTicketFill } from "react-icons/pi";
import { FaTent } from "react-icons/fa6";
import { Badge, Card, Space } from "antd";
import { useNavigate, useLocation } from 'react-router-dom'
import { FiArrowLeft } from "react-icons/fi";
import { MdSunny } from "react-icons/md";
import { formatEnumString } from "@lepark/data-utility";
import { PiPottedPlantFill } from "react-icons/pi";
import { getSpeciesById } from '@lepark/data-access';
import { BiWorld } from "react-icons/bi";
import { FaShieldHeart } from "react-icons/fa6";



const ViewSpecies = () => {
  const navigate = useNavigate();
  const cardStyle = "max-w-[30%] min-h-32 m-1 items-center !p-0" ;
  const iconStyle = "w-[100%] h-[100%] max-h-13 max-w-13 text-green-500 pb-2";
  const attributeStyle = "leading-none mt-1 text-center";
  //const id = "0f45c928-a0eb-40d1-b7a7-5eb32ae2e014";

const [speciesIdFromLocation, setSpeciesIdFromLocation] = useState<string | null>(null);
const [speciesObj, setSpeciesObj] = useState<Species | null>(null);
const location = useLocation();
const speciesId = location.state?.speciesId;
    useEffect(() => {
    if (speciesId) {
      const fetchSingleSpeciesById = async () => {
        try {
          const species = await getSpeciesById(speciesId);
          setSpeciesObj(species.data);

          console.log(`fetched species`, species.data);
        } catch (error) {
          console.error('Error fetching species:', error);
        }
      };
      fetchSingleSpeciesById();
    } else {
      console.error('No species ID provided');
    }
  }, [speciesId]);

  return (
    // <MainLayout>
    <>
    <div className="p-4 bg-green-50">
      <CustButton
        className="mb-2"
        text="Back"
        icon={
          <span className="text-green-500 text-xl">
            <FiArrowLeft />
          </span>
        }
        onClick={() => {
          navigate('/discover');
        }}
      />
      <h1 className="text-2xl font-medium text-green-500">{speciesObj?.speciesName}</h1>

      <div className="flex justify-center">
        <Card className={cardStyle} bodyStyle={{ padding: '10px' }}>
          {<PiPottedPlantFill className={iconStyle}/>}
          <p className={attributeStyle}>{formatEnumString(speciesObj?.soilType)}</p>
        </Card>

        <Card className={cardStyle} bodyStyle={{ padding: '10px' }}>
          {<BiWorld className={iconStyle}/>}
          <p className={attributeStyle}>{speciesObj?.originCountry} </p>
        </Card>

        <Card className={cardStyle} bodyStyle={{ padding: '10px' }}>
          {<FaShieldHeart className={iconStyle}/>}
          <p className={attributeStyle}>{formatEnumString(speciesObj?.conservationStatus)} </p>
        </Card>
      </div>
      <h5 className="text-[#767676]">
        <p >No. of Occurrences: </p>
        <p >Min. Temp: {speciesObj?.minTemp}°C</p>
        <p >Max. Temp: {speciesObj?.maxTemp}°C</p>
      </h5>
    </div>
    <div className="p-4">
    <h1 className="text-xl font-medium text-black">Occurrences</h1>
    </div>
    </>
    // </MainLayout>
  );
};

export default ViewSpecies;
