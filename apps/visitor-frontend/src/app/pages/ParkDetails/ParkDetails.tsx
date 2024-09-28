import { getParkById, ParkResponse } from "@lepark/data-access";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ParkDetails = () => {
  const { parkId } = useParams<{ parkId: string }>();
  const [park, setPark] = useState<ParkResponse>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (parkId) {
        setLoading(true);
        try {
          const occurrenceResponse = await getParkById(parseInt(parkId));
          setPark(occurrenceResponse.data);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching Park:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [parkId]);
 return <></> 
}

export default ParkDetails;