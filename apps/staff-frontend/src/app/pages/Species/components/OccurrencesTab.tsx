import { SpeciesResponse } from '@lepark/data-access';
import { Input } from 'antd';
import React from 'react';
import { FiSearch } from 'react-icons/fi';
import OccurrenceTable from './OccurrenceTable';

interface OccurrencesTabProps {
  species: SpeciesResponse; // Define the type for species
}

const OccurrencesTab: React.FC<OccurrencesTabProps> = ({ species }) => {
  const loading = false; // Replace with your actual loading state if needed

  return (
    <div>
      <OccurrenceTable speciesId={species.id} loading={loading} />
    </div>
  );
};

export default OccurrencesTab;
