import { useState, useEffect, useCallback } from 'react';
import { AttractionResponse, getAllAttractions, StaffResponse, StaffType } from '@lepark/data-access';
import { useAuth } from '@lepark/common-ui';

export const useFetchAttractions = () => {
    const [attractions, setAttractions] = useState<AttractionResponse[]>([]);
    const { user } = useAuth<StaffResponse>();
    const [loading, setLoading] = useState(false);
    const [trigger, setTrigger] = useState(false);
  
    useEffect(() => {
      if (!user) return;
      if (user?.role === StaffType.SUPERADMIN) {
        fetchAllAttractions();
      } else if (user?.parkId) {
      //  fetchAttractionsByParkId(user.parkId)
      }
    }, [user, trigger]);
  
    const fetchAllAttractions = async () => {
      setLoading(true);
      try {
        const attractionsRes = await getAllAttractions();
        if (attractionsRes.status === 200) {
          const attractionsData = attractionsRes.data as AttractionResponse[];
          setAttractions(attractionsData)
          setLoading(false);
        } 
      } catch (error) {
        setAttractions([]);
        setLoading(false);
      }
    }
  
    // const fetchAttractionsByParkId = async (parkId: number) => {
    //   setLoading(true);
    //   try {
    //     const attractionsRes = await getAttractionsByParkId(parkId);
    //     if (attractionsRes.status === 200) {
    //       const attractionsData = attractionsRes.data;
    //       setAttractions(attractionsData)
    //       setLoading(false);
    //     } 
    //   } catch (error) {
    //     setAttractions([]);
    //     setLoading(false);
    //   }
    // }
  
    const triggerFetch = () => {
      setTrigger(prev => !prev); // Toggle the trigger value
    };
  
    return { attractions, setAttractions, fetchAllAttractions, loading, triggerFetch };
  };
  