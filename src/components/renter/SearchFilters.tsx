import React from 'react';
import { MapPinIcon, CalendarIcon, CarIcon, SlidersIcon, SearchIcon } from 'lucide-react';
import Button from '../ui/Button';
const SearchFilters: React.FC = () => {
  return <div className="bg-white rounded-lg shadow-lg p-4 space-y-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <select className="w-full pl-10 pr-4 py-3 border rounded-lg focus:border-[#3EFEFE] focus:outline-none appearance-none">
            <option>Libreville</option>
            <option>Port-Gentil</option>
            <option>Franceville</option>
          </select>
        </div>
        <div className="relative">
          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="date" className="w-full pl-10 pr-4 py-3 border rounded-lg focus:border-[#3EFEFE] focus:outline-none" />
        </div>
        <div className="relative">
          <CarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <select className="w-full pl-10 pr-4 py-3 border rounded-lg focus:border-[#3EFEFE] focus:outline-none appearance-none">
            <option>Tout type</option>
            <option>SUV</option>
            <option>Berline</option>
            <option>4x4</option>
          </select>
        </div>
        <div className="relative">
          <SlidersIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <select className="w-full pl-10 pr-4 py-3 border rounded-lg focus:border-[#3EFEFE] focus:outline-none appearance-none">
            <option>Prix (FCFA)</option>
            <option>0 - 25,000</option>
            <option>25,000 - 50,000</option>
            <option>50,000+</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end">
        <Button className="md:w-auto w-full">
          <SearchIcon size={20} />
          Rechercher
        </Button>
      </div>
    </div>;
};
export default SearchFilters;