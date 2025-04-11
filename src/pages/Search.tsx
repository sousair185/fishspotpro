
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import UserSearchTab from '@/components/social/UserSearchTab';
import { useNavigate } from 'react-router-dom';

const Search = () => {
  const navigate = useNavigate();
  
  const handleSelectUser = (userId: string) => {
    navigate(`/messages`);
  };
  
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Buscar</h1>
        
        <UserSearchTab onSelectUser={handleSelectUser} />
      </div>
      
      <Navbar />
    </div>
  );
};

export default Search;
