import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ParkResponse } from '@lepark/data-access';

// interface ParkContextType {
//   selectedPark: ParkResponse | null;
//   setSelectedPark: (park: ParkResponse | null) => void;
// }

// const ParkContext = createContext<ParkContextType | undefined>(undefined);

// export const usePark = (): ParkContextType => {
//   const context = useContext(ParkContext);
//   if (!context) {
//     throw new Error('usePark must be used within a ParkProvider');
//   }
//   return context;
// };

// interface ParkProviderProps {
//   children: ReactNode;
// }

// export const ParkProvider: React.FC<ParkProviderProps> = ({ children }) => {
//   const [selectedPark, setSelectedPark] = useState<ParkResponse | null>(null);

//   return (
//     <ParkContext.Provider value={{ selectedPark, setSelectedPark }}>
//       {children}
//     </ParkContext.Provider>
//   );
// };

// // ParkContext.tsx
interface ParkContextType {
  selectedPark: ParkResponse | null;
  setSelectedPark: (park: ParkResponse | null) => void;
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
  const [selectedPark, setSelectedPark] = useState<ParkResponse | null>(() => null);

  const updateSelectedPark = (park: ParkResponse | null) => {
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