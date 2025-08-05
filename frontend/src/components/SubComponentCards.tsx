import React from 'react';
import { BookOpen, Wifi, DollarSign } from 'lucide-react';
import type { CountryData } from '../types';

interface SubComponentCardsProps {
  data: CountryData[];
}

export const SubComponentCards: React.FC<SubComponentCardsProps> = ({ data }) => {
  const calculateAverage = (key: keyof CountryData) => {
    if (data.length === 0) return 0;
    return data.reduce((sum, country) => sum + (country[key] as number), 0) / data.length;
  };

  const getTopCountry = (key: keyof CountryData) => {
    if (data.length === 0) return { name: 'N/A', [key]: 0 } as CountryData;
    return data.reduce((prev, current) => 
      (prev[key] as number) > (current[key] as number) ? prev : current
    );
  };

  const components = [
    {
      title: 'Literacy Rate',
      key: 'literacyRate' as keyof CountryData,
      icon: BookOpen,
      color: 'bg-blue-500',
      description: 'Financial literacy and education levels across African countries'
    },
    {
      title: 'Digital Infrastructure',
      key: 'digitalInfrastructure' as keyof CountryData,
      icon: Wifi,
      color: 'bg-green-500',
      description: 'Internet connectivity, mobile penetration, and digital infrastructure'
    },
    {
      title: 'Investment',
      key: 'investment' as keyof CountryData,
      icon: DollarSign,
      color: 'bg-purple-500',
      description: 'Foreign and domestic investment in fintech sector'
    }
  ];

  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Mobile Layout - Compact Stacked Cards */}
      <div className="space-y-3 sm:hidden px-2">
        {components.map((component) => {
          const average = calculateAverage(component.key);
          const topCountry = getTopCountry(component.key);
          const score = Number(topCountry[component.key]) || 0;
          
          return (
            <div key={component.title} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mx-auto max-w-sm">
              <div className="flex items-start space-x-3 mb-2">
                <div className={`w-8 h-8 ${component.color} rounded-lg flex items-center justify-center shadow-sm flex-shrink-0`}>
                  <component.icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{component.title}</h3>
                  <p className="text-base font-semibold text-blue-600 mb-1">{average.toFixed(1)}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{component.description}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-gray-50 rounded p-2">
                  <span className="text-xs font-medium text-gray-600">Top Performer:</span>
                  <span className="text-xs font-bold text-gray-900">{topCountry.name}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Progress</span>
                    <span>{score.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-500"
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Small Tablet Layout - 2 Columns */}
      <div className="hidden sm:grid lg:hidden grid-cols-2 gap-3 px-3">
        {components.map((component) => {
          const average = calculateAverage(component.key);
          const topCountry = getTopCountry(component.key);
          const score = Number(topCountry[component.key]) || 0;
          
          return (
            <div key={component.title} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-10 h-10 ${component.color} rounded-lg flex items-center justify-center shadow-sm`}>
                  <component.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">{average.toFixed(1)}</p>
                  <p className="text-xs text-gray-500 font-medium">Average Score</p>
                </div>
              </div>
              
              <h3 className="text-sm font-bold text-gray-900 mb-2">{component.title}</h3>
              <p className="text-xs text-gray-600 mb-2 leading-relaxed">{component.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-600">Top Performer:</span>
                  <span className="text-xs font-bold text-gray-900">{topCountry.name}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Progress</span>
                    <span>{score.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-500"
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Layout - 3 Columns */}
      <div className="hidden lg:grid grid-cols-3 gap-4 px-4">
        {components.map((component) => {
          const average = calculateAverage(component.key);
          const topCountry = getTopCountry(component.key);
          const score = Number(topCountry[component.key]) || 0;
          
          return (
            <div key={component.title} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 ${component.color} rounded-lg flex items-center justify-center shadow-sm`}>
                  <component.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-blue-600">{average.toFixed(1)}</p>
                  <p className="text-sm text-gray-500 font-medium">Average Score</p>
                </div>
              </div>
              
              <h3 className="text-base font-bold text-gray-900 mb-3">{component.title}</h3>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">{component.description}</p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                  <span className="text-sm font-medium text-gray-600">Top Performer:</span>
                  <span className="text-sm font-bold text-gray-900">{topCountry.name}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Progress</span>
                    <span>{score.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-500"
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};