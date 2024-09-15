import { useState, useEffect } from 'react';
import { message } from 'antd';
import { useAuth } from '@lepark/common-ui';
import { addFavoriteSpecies, deleteSpeciesFromFavorites, getAllOccurrences, getFavoriteSpecies, getOccurrenceById, getOccurrencesByParkId, getParkById, OccurrenceResponse, SpeciesResponse, StaffResponse, StaffType, VisitorResponse } from '@lepark/data-access';

export const useHandleFavoriteSpecies = () => {
  const [favoriteSpecies, setFavoriteSpecies] = useState<string[]>([]);
  const { user } = useAuth<VisitorResponse>();
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchFavoriteSpecies(user.id);
  }, [user, trigger]);

  const isFavoriteSpecies = (speciesId: string) => {
    return favoriteSpecies.includes(speciesId);
  };

  const fetchFavoriteSpecies = async (userId: string) => {
    setLoading(true);
    try {
      const favoriteSpeciesRes = await getFavoriteSpecies(userId);
      console.log(favoriteSpeciesRes)
      if (favoriteSpeciesRes.status === 200) {
        const favoriteSpeciesData = favoriteSpeciesRes.data;
        const favoriteSpeciesIds = favoriteSpeciesData.map(item => item.id)
        setFavoriteSpecies(favoriteSpeciesIds);
        setLoading(false);
      } 
    } catch (error) {
      setFavoriteSpecies([]);
      setLoading(false);
    }
  }

  const handleAddToFavorites = async (speciesId: string) => {
    if (speciesId && user) {
      try {
        const addFavoriteSpeciesData = {
          visitorId: user.id,
          speciesId: speciesId
        };
        await addFavoriteSpecies(addFavoriteSpeciesData);
        message.success('Species added to favorites!');
        triggerFetch();
      } catch (error) {
        console.error('Error adding species to favorites:', error);
        message.error('Failed to add species to favorites. Please try again.');
      }
    }
  };

  const handleRemoveFromFavorites = async (speciesId: string) => {
    if (speciesId && user) {
      try {
        await deleteSpeciesFromFavorites(user.id, speciesId);
        message.success('Species removed from favorites!');
        triggerFetch();
      } catch (error) {
        console.error('Error removing species from favorites:', error);
        message.error('Failed to remove species from favorites. Please try again.');
      }
    }
  };

  const triggerFetch = () => {
    setTrigger(prev => !prev); // Toggle the trigger value
  };

  return { favoriteSpecies, setFavoriteSpecies, loading, isFavoriteSpecies, triggerFetch, handleAddToFavorites, handleRemoveFromFavorites };
};
