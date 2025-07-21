import { CountryData, DashboardStats } from '../types';

export const mockCountryData: CountryData[] = [
  // 2024 Data
  {
    id: 'NG',
    name: 'Nigeria',
    literacyRate: 62.0,
    digitalInfrastructure: 78.5,
    investment: 85.2,
    finalScore: 75.2,
    year: 2024,
    population: 218000000,
    gdp: 440.8,
    fintechCompanies: 144
  },
  {
    id: 'ZA',
    name: 'South Africa',
    literacyRate: 94.3,
    digitalInfrastructure: 82.1,
    investment: 71.8,
    finalScore: 82.7,
    year: 2024,
    population: 60000000,
    gdp: 419.0,
    fintechCompanies: 89
  },
  {
    id: 'KE',
    name: 'Kenya',
    literacyRate: 81.5,
    digitalInfrastructure: 75.3,
    investment: 68.9,
    finalScore: 75.2,
    year: 2024,
    population: 54000000,
    gdp: 110.3,
    fintechCompanies: 67
  },
  {
    id: 'EG',
    name: 'Egypt',
    literacyRate: 71.2,
    digitalInfrastructure: 69.8,
    investment: 64.5,
    finalScore: 68.5,
    year: 2024,
    population: 104000000,
    gdp: 469.0,
    fintechCompanies: 52
  },
  {
    id: 'GH',
    name: 'Ghana',
    literacyRate: 79.0,
    digitalInfrastructure: 72.4,
    investment: 58.7,
    finalScore: 70.0,
    year: 2024,
    population: 32000000,
    gdp: 73.0,
    fintechCompanies: 34
  },
  {
    id: 'MA',
    name: 'Morocco',
    literacyRate: 73.8,
    digitalInfrastructure: 68.9,
    investment: 62.3,
    finalScore: 68.3,
    year: 2024,
    population: 37000000,
    gdp: 132.0,
    fintechCompanies: 28
  },
  {
    id: 'ET',
    name: 'Ethiopia',
    literacyRate: 51.8,
    digitalInfrastructure: 45.2,
    investment: 38.7,
    finalScore: 45.2,
    year: 2024,
    population: 120000000,
    gdp: 107.6,
    fintechCompanies: 15
  },
  {
    id: 'TZ',
    name: 'Tanzania',
    literacyRate: 77.9,
    digitalInfrastructure: 52.6,
    investment: 42.1,
    finalScore: 57.5,
    year: 2024,
    population: 61000000,
    gdp: 67.8,
    fintechCompanies: 22
  },

  // 2023 Data
  {
    id: 'NG',
    name: 'Nigeria',
    literacyRate: 59.5,
    digitalInfrastructure: 75.2,
    investment: 82.1,
    finalScore: 72.3,
    year: 2023,
    population: 216000000,
    gdp: 432.3,
    fintechCompanies: 128
  },
  {
    id: 'ZA',
    name: 'South Africa',
    literacyRate: 93.1,
    digitalInfrastructure: 79.8,
    investment: 69.2,
    finalScore: 80.7,
    year: 2023,
    population: 59000000,
    gdp: 408.2,
    fintechCompanies: 82
  },
  {
    id: 'KE',
    name: 'Kenya',
    literacyRate: 79.2,
    digitalInfrastructure: 72.1,
    investment: 65.8,
    finalScore: 72.4,
    year: 2023,
    population: 53000000,
    gdp: 106.0,
    fintechCompanies: 61
  },
  {
    id: 'EG',
    name: 'Egypt',
    literacyRate: 68.9,
    digitalInfrastructure: 66.5,
    investment: 61.2,
    finalScore: 65.5,
    year: 2023,
    population: 102000000,
    gdp: 458.0,
    fintechCompanies: 47
  },
  {
    id: 'GH',
    name: 'Ghana',
    literacyRate: 76.8,
    digitalInfrastructure: 69.1,
    investment: 55.4,
    finalScore: 67.1,
    year: 2023,
    population: 31000000,
    gdp: 70.1,
    fintechCompanies: 29
  },
  {
    id: 'MA',
    name: 'Morocco',
    literacyRate: 71.5,
    digitalInfrastructure: 65.6,
    investment: 59.1,
    finalScore: 65.4,
    year: 2023,
    population: 36000000,
    gdp: 126.0,
    fintechCompanies: 24
  },
  {
    id: 'ET',
    name: 'Ethiopia',
    literacyRate: 49.1,
    digitalInfrastructure: 41.8,
    investment: 35.2,
    finalScore: 42.0,
    year: 2023,
    population: 118000000,
    gdp: 101.2,
    fintechCompanies: 12
  },
  {
    id: 'TZ',
    name: 'Tanzania',
    literacyRate: 75.2,
    digitalInfrastructure: 49.3,
    investment: 38.9,
    finalScore: 54.5,
    year: 2023,
    population: 60000000,
    gdp: 64.4,
    fintechCompanies: 18
  }
];

export const calculateDashboardStats = (data: CountryData[]): DashboardStats => {
  if (data.length === 0) {
    return {
      totalCountries: 0,
      averageScore: 0,
      topPerformer: 'N/A',
      yearOverYearChange: 0,
      totalFintechCompanies: 0,
      averageFintechCompanies: 0
    };
  }

  const averageScore = data.reduce((sum, country) => sum + country.finalScore, 0) / data.length;
  const topPerformer = data.reduce((prev, current) => 
    prev.finalScore > current.finalScore ? prev : current
  );
  
  const totalFintechCompanies = data.reduce((sum, country) => sum + (country.fintechCompanies || 0), 0);
  const averageFintechCompanies = totalFintechCompanies / data.length;

  return {
    totalCountries: data.length,
    averageScore,
    topPerformer: topPerformer.name,
    yearOverYearChange: 5.2, // This would be calculated from historical data
    totalFintechCompanies,
    averageFintechCompanies
  };
};

export const dashboardStats: DashboardStats = calculateDashboardStats(
  mockCountryData.filter(country => country.year === 2024)
);

export const availableYears = [2024, 2023, 2022, 2021, 2020];