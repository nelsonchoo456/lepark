import { useState, useEffect } from 'react';
import { message } from 'antd'; // or whatever message system you are using
import { useAuth } from '@lepark/common-ui';
import { getAllSpecies, getAllZones, getZonesByParkId, SpeciesResponse, StaffResponse, StaffType, ZoneResponse } from '@lepark/data-access';
import { useNavigate } from 'react-router-dom'; // or your routing solution

export const useFetchSpecies = () => {
  const [species, setSpecies] = useState<SpeciesResponse[]>([]);
  const [speciesLoading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllSpecies();
  }, []);

  const fetchAllSpecies = async () => {
    try {
      setLoading(true);
      const response = await getAllSpecies();
      setSpecies(response.data);
    } catch (error) {
      message.error('Failed to fetch Species');
    } finally {
      setLoading(false);
    }
  };

  return { species, speciesLoading};
};
