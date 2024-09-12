import { useState, useEffect } from 'react';
import { message } from 'antd'; // or whatever message system you are using
import { useAuth } from '@lepark/common-ui';
import { getAllParks, getAllZones, getParkById, getZonesByParkId, ParkResponse, StaffResponse, StaffType, ZoneResponse } from '@lepark/data-access';
import { useNavigate } from 'react-router-dom'; // or your routing solution

export const useFetchParks = () => {
  const [parks, setParks] = useState<ParkResponse[]>([]);
  const [restrictedParkId, setRestrictedParkId] = useState<number | null>(null);
  const { user } = useAuth<StaffResponse>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.parkId) return;

    if (user?.role === StaffType.SUPERADMIN) {
      fetchAllParks();
    } else {
      fetchParkById(user.parkId)
      setRestrictedParkId(user.parkId);
    }
  }, [user]);

  const fetchAllParks = async () => {
    setLoading(true);
    try {
      const parksRes = await getAllParks();
      if (parksRes.status === 200) {
        const parksData = parksRes.data;
        setParks(parksData)
        setLoading(false);
      } 
    } catch (error) {
      setLoading(false);
    }
  }

  const fetchParkById = async (parkId: number) => {
    setLoading(true);
    try {
      const parksRes = await getParkById(parkId);
      if (parksRes.status === 200) {
        const parksData = parksRes.data;
        setParks([parksData])
        setLoading(false);
      } 
    } catch (error) {
      setLoading(false);
    }
  }

  return { parks, restrictedParkId, setParks, fetchAllParks, loading };
};
