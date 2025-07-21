import React from 'react';
import { FintechStartups } from '../components/FintechStartups';
import { useContext } from 'react';
import { AuthContext } from '../App';

const StartupsPage: React.FC = () => {
  const { currentUser } = useContext(AuthContext);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      <main className="flex-1 px-4 sm:px-8 lg:px-16 py-10 space-y-10">
        <h1 className="text-2xl font-bold mb-4">Fintech Startups</h1>
        <FintechStartups currentUser={currentUser} />
      </main>
    </div>
  );
};

export default StartupsPage; 