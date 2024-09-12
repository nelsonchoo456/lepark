import { useState, useEffect } from 'react';
import { message } from 'antd';
import { useAuth } from '@lepark/common-ui';
import { getAllParks, getParkById, ParkResponse, StaffResponse, StaffType } from '@lepark/data-access';

export const useFetchParks = () => {
  const [parks, setParks] = useState<ParkResponse[]>([]);
  const [restrictedParkId, setRestrictedParkId] = useState<number | null>(null);
  const { user } = useAuth<StaffResponse>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user?.role === StaffType.SUPERADMIN) {
      fetchAllParks();
    } else if (user?.parkId) {
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
