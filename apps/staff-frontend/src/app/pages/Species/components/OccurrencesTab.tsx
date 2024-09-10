import React from 'react';
import OccurrenceTable from './OccurrenceTable'; // Adjust the import path as needed
import { SpeciesResponse } from '@lepark/data-access';

interface OccurrencesTabProps {
  species: SpeciesResponse; // Define the type for species
}

const OccurrencesTab: React.FC<OccurrencesTabProps> = ({ species }) => {
  const occurrences = species?.occurrences || []; // Use species.occurrences directly
  const loading = false; // Replace with your actual loading state if needed

  return (
    <div>
      <OccurrenceTable occurrences={occurrences} loading={loading} />
    </div>
  );
};

export default OccurrencesTab;
