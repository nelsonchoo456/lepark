// withParkGuard.tsx
import React, { ComponentType, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePark } from './ParkContext';

const withParkGuard = <P extends object>(Component: ComponentType<P>) => {
  return (props: P) => {
    const { selectedPark } = usePark();
    const navigate = useNavigate();

    useEffect(() => {
      if (!selectedPark) {
        navigate('/select-park');
      }
    }, [selectedPark, navigate]);

    // Render the component only if the park is selected
    return selectedPark ? <Component {...props} /> : null;
  };
};

export default withParkGuard;
