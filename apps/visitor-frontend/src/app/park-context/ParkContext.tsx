// ParkContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Park {
  id: string;
  name: string;
  // Add other park properties as necessary
}

interface ParkContextType {
  selectedPark: Park | null;
  setSelectedPark: (park: Park | null) => void;
}

const ParkContext = createContext<ParkContextType | undefined>(undefined);

export const usePark = (): ParkContextType => {
  const context = useContext(ParkContext);
  if (!context) {
    throw new Error('usePark must be used within a ParkProvider');
  }
  return context;
};

interface ParkProviderProps {
  children: ReactNode;
}

export const ParkProvider: React.FC<ParkProviderProps> = ({ children }) => {
  const [selectedPark, setSelectedPark] = useState<Park | null>(() => {
    const savedPark = localStorage.getItem('selectedPark');
    return savedPark ? JSON.parse(savedPark) : null;
  });

  const updateSelectedPark = (park: Park | null) => {
    setSelectedPark(park);
    if (park) {
      localStorage.setItem('selectedPark', JSON.stringify(park));
    } else {
      localStorage.removeItem('selectedPark');
    }
  };

  return (
    <ParkContext.Provider value={{ selectedPark, setSelectedPark: updateSelectedPark }}>
      {children}
    </ParkContext.Provider>
  );
};