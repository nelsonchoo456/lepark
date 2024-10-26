// withParkGuard.tsx
import React, { ComponentType, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePark } from './ParkContext';

const withParkGuard = <P extends object>(Component: ComponentType<P>) => {
  return (props: P) => {
    const { selectedPark } = usePark();
    const navigate = useNavigate();

    useEffect(() => {
      const checkSelectedPark = async () => {
        if (!selectedPark) {
          const storedPark = localStorage.getItem('selectedPark');
          if (!storedPark) {
            navigate('/select-park');
          }
        }
      };

      checkSelectedPark();
    }, [selectedPark, navigate]);

    // Render the component only if the park is selected or stored in local storage
    return selectedPark || localStorage.getItem('selectedPark') ? <Component {...props} /> : null;
  };
};

export default withParkGuard;
