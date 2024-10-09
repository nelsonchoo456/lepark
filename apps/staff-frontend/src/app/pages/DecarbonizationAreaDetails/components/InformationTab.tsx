import { DecarbonizationAreaResponse } from '@lepark/data-access';
import { Descriptions, Divider, Typography } from 'antd';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

interface InformationTabProps {
  decarbonizationArea: DecarbonizationAreaResponse;
}

const InformationTab = ({ decarbonizationArea }: InformationTabProps) => {
  const detailsItems = [
   {
      key: 'parkName',
      label: 'Park Name',
      children: decarbonizationArea.parkId,
    },
  ];

  return (
    <div>
      <Divider orientation="left">Decarbonization Area Details</Divider>
      <Descriptions key="details" items={detailsItems} column={1} bordered labelStyle={{ width: "15vw"}} contentStyle={{ fontWeight: "500" }}/>
    </div>
  );
};

export default InformationTab;  