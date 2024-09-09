import { Descriptions } from 'antd';
import { OccurrenceResponse } from '@lepark/data-access';
import moment from 'moment';

const InformationTab = ({ occurrence }: { occurrence: OccurrenceResponse }) => {
  const descriptionsItems = [
    { key: 'id', label: 'ID', children: occurrence.id },
    { key: 'title', label: 'Title', children: occurrence.title },
    { key: 'speciesName', label: 'Species Name', children: occurrence.speciesName },
    { key: 'dateObserved', label: 'Date Observed', children: moment(occurrence.dateObserved).format('MMMM D, YYYY') },
    { key: 'dateOfBirth', label: 'Date of Birth', children: moment(occurrence.dateOfBirth).format('MMMM D, YYYY') },
    { key: 'numberOfPlants', label: 'Number of Plants', children: occurrence.numberOfPlants },
    { key: 'biomass', label: 'Biomass', children: `${occurrence.biomass} kg` },
    { key: 'lat', label: 'Latitude', children: occurrence.lat },
    { key: 'lng', label: 'Longitude', children: occurrence.lng },
    { key: 'description', label: 'Description', children: occurrence.description },
  ];

  return (
    <div>
      <Descriptions items={descriptionsItems} bordered column={1} size="middle" />
    </div>
  );
};

export default InformationTab;
