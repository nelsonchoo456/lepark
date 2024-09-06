import React, { useState } from 'react';
import { ContentWrapper, Divider, LogoText, CustButton } from "@lepark/common-ui";
import MainLayout from "../../components/main/MainLayout";
import { NavButton } from "../../components/buttons/NavButton";
import { PiPlantFill, PiStarFill, PiTicketFill } from "react-icons/pi";
import { FaTent } from "react-icons/fa6";
import { Badge, Card, Space } from "antd";
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft } from "react-icons/fi";
import { MdSunny } from "react-icons/md";
import { species, speciesExamples } from "@lepark/data-utility";



const ViewSpecies = () => {
  const navigate = useNavigate();
  const cardStyle = "max-w-[30%] min-h-32 m-1.5 items-center";
  const iconStyle = "w-[100%] h-[100%] max-h-16 text-green-500 pb-2";
  const attributeStyle = "leading-none mt-1";

  const [isExpanded, setIsExpanded] = useState(false);

  const description = species.speciesDescription + "filler filler filler text filler text filler filler filler filler filler text filler text filler filler text filler filler filler text filler filler filler text filler text filler filler filler filler filler text filler text filler filler text filler filler filler text filler filler filler text filler text filler filler filler filler filler text filler text filler filler text filler filler filler text ";
  const truncatedDescription = description.slice(0, 150);

  return (
    // <MainLayout>
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
      <h1 className="text-2xl font-medium text-green-500">{species.speciesName}</h1>

      <div className="flex justify-center">
        <Card className={cardStyle} >
          {<MdSunny className={iconStyle}/>}
          <p className={attributeStyle}>{/*species.lightType*/}Partial sun</p>
        </Card>

        <Card className={cardStyle}>
          {<MdSunny className={iconStyle}/>}
          <p className={attributeStyle}>filler text </p>
        </Card>

        <Card className={cardStyle}>
          {<MdSunny className={iconStyle}/>}
          <p className={attributeStyle}>filler text </p>
        </Card>
      </div>
      <h5 className="text-[#767676]">
        <p className="leading-snug">
          {isExpanded ? description : truncatedDescription}
          {description.length > 150 && !isExpanded && '...'}
        </p>
        {description.length > 150 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-500 hover:text-blue-700 mt-1 text-sm focus:outline-none"
          >
            {isExpanded ? 'View less' : 'View more'}
          </button>
        )}
      </h5>
    </div>
    // </MainLayout>
  );
};

export default ViewSpecies;
