import React from 'react';
import { TrendingUp, Globe, Award, Activity, Building2, BarChart3 } from 'lucide-react';
import type { DashboardStats } from '../types';

interface StatsCardsProps {
  stats: DashboardStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Countries',
      value: stats.totalCountries.toString(),
      icon: Globe,
      color: 'bg-blue-500',
      change: null
    },
    {
      title: 'Average Index Score',
      value: stats.averageScore.toFixed(1),
      icon: Activity,
      color: 'bg-green-500',
      change: stats.yearOverYearChange
    },
    {
      title: 'Top Performer',
      value: stats.topPerformer,
      icon: Award,
      color: 'bg-yellow-500',
      change: null
    },
    {
      title: 'Total Fintech Companies',
      value: stats.totalFintechCompanies.toString(),
      icon: Building2,
      color: 'bg-purple-500',
      change: null
    },
    {
      title: 'Avg Companies/Country',
      value: stats.averageFintechCompanies.toFixed(0),
      icon: BarChart3,
      color: 'bg-indigo-500',
      change: null
    },
    {
      title: 'YoY Change',
      value: `+${stats.yearOverYearChange}%`,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      change: stats.yearOverYearChange
    }
  ];

  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Mobile Layout - Compact Stacked Cards */}
      <div className="space-y-2 sm:hidden px-2">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mx-auto max-w-sm">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 ${card.color} rounded-lg flex items-center justify-center shadow-sm flex-shrink-0`}>
                <card.icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-medium text-gray-600 mb-1">{card.title}</h3>
                <p className="text-lg font-bold text-gray-900 mb-1">{card.value}</p>
                {card.change && (
                  <p className={`text-xs font-medium ${card.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {card.change > 0 ? '+' : ''}{card.change}% from last year
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Small Tablet Layout - 2 Columns */}
      <div className="hidden sm:grid md:hidden grid-cols-2 gap-3 px-3">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-all duration-200">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center shadow-sm`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <div className="w-full">
                <h3 className="text-xs font-medium text-gray-600 mb-1">{card.title}</h3>
                <p className="text-base font-bold text-gray-900 mb-1">{card.value}</p>
                {card.change && (
                  <p className={`text-xs font-medium ${card.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {card.change > 0 ? '+' : ''}{card.change}%
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Medium Tablet Layout - 3 Columns */}
      <div className="hidden md:grid lg:hidden grid-cols-3 gap-3 px-4">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-all duration-200">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center shadow-sm`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div className="w-full">
                <h3 className="text-sm font-medium text-gray-600 mb-1">{card.title}</h3>
                <p className="text-lg font-bold text-gray-900 mb-1">{card.value}</p>
                {card.change && (
                  <p className={`text-xs font-medium ${card.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {card.change > 0 ? '+' : ''}{card.change}%
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Large Desktop Layout - 6 Columns */}
      <div className="hidden lg:grid grid-cols-6 gap-3 px-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-all duration-200">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center shadow-sm`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <div className="w-full">
                <h3 className="text-xs font-medium text-gray-600 mb-1">{card.title}</h3>
                <p className="text-sm font-bold text-gray-900 mb-1">{card.value}</p>
                {card.change && (
                  <p className={`text-xs font-medium ${card.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {card.change > 0 ? '+' : ''}{card.change}%
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};