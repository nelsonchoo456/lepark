import React from 'react';
import OccurrenceTable from './OccurrenceTable';
import { SpeciesResponse } from '@lepark/data-access';
import { FiSearch } from 'react-icons/fi';
import { Input } from 'antd';

interface OccurrencesTabProps {
  species: SpeciesResponse; // Define the type for species
}

const OccurrencesTab: React.FC<OccurrencesTabProps> = ({ species }) => {
  const loading = false; // Replace with your actual loading state if needed

  return (
    <div>
      <Input
        suffix={<FiSearch />}
        placeholder="Search in Occurrences..."
        className="mb-4 bg-white"
        style={{
          outline: '2px solid rgba(248, 248, 248, var(--tw-bg-opacity))', // Add outline with desired color
          borderRadius: '4px', // Optional: Add border radius
        }}
        variant="filled"
      />

      <OccurrenceTable speciesId={species.id} loading={loading} />
    </div>
  );
};

export default OccurrencesTab;
