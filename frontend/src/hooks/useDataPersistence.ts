import { useState, useEffect } from 'react';
import { CountryData } from '../types';

const STORAGE_KEY = 'fintechIndexData';
const STORAGE_VERSION = '1.0';

interface StoredData {
  version: string;
  data: CountryData[];
  lastUpdated: number;
  updatedBy?: string;
}

export const useDataPersistence = (initialData: CountryData[]) => {
  const [data, setData] = useState<CountryData[]>(initialData);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadStoredData = () => {
      try {
        const storedDataString = localStorage.getItem(STORAGE_KEY);
        if (storedDataString) {
          const storedData: StoredData = JSON.parse(storedDataString);
          
          // Check if stored data is valid and not too old (30 days)
          const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
          if (storedData.version === STORAGE_VERSION && 
              storedData.lastUpdated > thirtyDaysAgo &&
              Array.isArray(storedData.data) &&
              storedData.data.length > 0) {
            
            console.log('Loading persisted data from localStorage');
            setData(storedData.data);
          } else {
            console.log('Stored data is outdated or invalid, using initial data');
            setData(initialData);
          }
        } else {
          console.log('No stored data found, using initial data');
          setData(initialData);
        }
      } catch (error) {
        console.error('Error loading stored data:', error);
        setData(initialData);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredData();
  }, [initialData]);

  // Save data to localStorage whenever data changes
  const saveData = (newData: CountryData[], updatedBy?: string) => {
    try {
      const dataToStore: StoredData = {
        version: STORAGE_VERSION,
        data: newData,
        lastUpdated: Date.now(),
        updatedBy
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
      console.log('Data saved to localStorage');
      setData(newData);
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
      // Still update the state even if localStorage fails
      setData(newData);
    }
  };

  // Update data with admin tracking - OVERWRITE EXISTING DATASET
  const updateData = (newData: CountryData[]) => {
    const authData = localStorage.getItem('fintechAdminAuth');
    let updatedBy = 'Unknown';
    
    if (authData) {
      try {
        const auth = JSON.parse(authData);
        updatedBy = auth.username || 'Admin';
      } catch (error) {
        console.error('Error parsing auth data:', error);
      }
    }

    // OVERWRITE: Replace all existing data with new data
    console.log('Overwriting existing dataset with new data');
    saveData(newData, updatedBy);
  };

  // Clear all stored data
  const clearData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setData(initialData);
      console.log('Stored data cleared');
    } catch (error) {
      console.error('Error clearing stored data:', error);
    }
  };

  // Get data info
  const getDataInfo = () => {
    try {
      const storedDataString = localStorage.getItem(STORAGE_KEY);
      if (storedDataString) {
        const storedData: StoredData = JSON.parse(storedDataString);
        return {
          lastUpdated: new Date(storedData.lastUpdated),
          updatedBy: storedData.updatedBy,
          recordCount: storedData.data.length,
          years: [...new Set(storedData.data.map(d => d.year))].sort((a, b) => b - a)
        };
      }
    } catch (error) {
      console.error('Error getting data info:', error);
    }
    return null;
  };

  return {
    data,
    isLoading,
    updateData,
    clearData,
    getDataInfo
  };
};