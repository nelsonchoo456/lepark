import { Descriptions, Spin } from 'antd';
import { OccurrenceResponse, SpeciesResponse, ZoneResponse } from '@lepark/data-access';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { getSpeciesById, getZoneById } from '@lepark/data-access';

const InformationTab = ({ occurrence }: { occurrence: OccurrenceResponse }) => {
  const [species, setSpecies] = useState<SpeciesResponse | null>(null);
  const [zone, setZone] = useState<ZoneResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const response = await getSpeciesById(occurrence.speciesId);
        const zoneResponse = await getZoneById(occurrence.zoneId);
        setSpecies(response.data);
        setZone(zoneResponse.data);
      } catch (error) {
        console.error('Error fetching species:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecies();
  }, [occurrence.speciesId, occurrence.zoneId]);

  const descriptionsItems = [
    { key: 'title', label: 'Title', children: occurrence.title },
    { key: 'description', label: 'Description', children: occurrence.description },
    { 
      key: 'zone', 
      label: 'Zone', 
      children: (
        <div>
          <div className='flex'>{zone ? zone.name : 'Loading...'}</div>
        </div>
      )
    },
    { key: 'dateObserved', label: 'Date Observed', children: moment(occurrence.dateObserved).format('MMMM D, YYYY') },
    { key: 'dateOfBirth', label: 'Date of Birth', children: moment(occurrence.dateOfBirth).format('MMMM D, YYYY') },
    { key: 'numberOfPlants', label: 'Number of Plants', children: occurrence.numberOfPlants },
    { key: 'biomass', label: 'Biomass', children: `${occurrence.biomass} kg` },
    { key: 'lat', label: 'Latitude', children: occurrence.lat },
    { key: 'lng', label: 'Longitude', children: occurrence.lng },
  ];

  if (loading) {
    return <Spin />;
  }

  return (
    <div>
      <Descriptions items={descriptionsItems} bordered column={1} size="middle" />
    </div>
  );
};

export default InformationTab;
