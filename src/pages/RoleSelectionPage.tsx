import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/css/RoleSelectionPage.css'; // Import your CSS file for styling

import { CircleIcon } from 'lucide-react';
const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'owner' | 'renter' | 'admin' | null>(null);
  const handleRoleSelect = (role: 'owner' | 'renter'| 'admin' ) => {
    setSelectedRole(role);
    if (role === 'owner') {
      navigate('/owner/Login');
    } else if (role === 'renter') {
      navigate('/renter/Login');
    }
    else if (role === 'admin') {
      navigate('/admin/login');
    }
  };
  return <div className="flex flex-col min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-1xl font-bold text-gray-800">
            S'inscrire sur Lotu en tant que ?
          </h2>
          <p className="text-gray-600">Sélectionnez votre rôle ici</p>
        </div>
        <div className="w-12 h-12">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full" id='circleroleselection' onClick={() => handleRoleSelect('admin')}>
            <polygon points="12,3 21,19 3,19" strokeWidth="1.5" fill="none" />
            
            <circle cx="12" cy="16" r="1" fill="currentColor" />
            
            <rect x="11.5" y="7" width="1" height="7" fill="currentColor" />
          </svg>
        </div>
      </div>
      <div className="space-y-6 mt-6">
        <div className={`p-6 rounded-xl ${selectedRole === 'owner' ? 'bg-black text-white' : 'bg-black text-white opacity-90'}`} onClick={() => handleRoleSelect('owner')}>
          <div className="flex justify-between items-center mb-8">
            <div className={`w-6 h-6 rounded-full border-2 ${selectedRole === 'owner' ? 'bg-white border-white' : 'border-white'}`}></div>
            <span>CLIQUEZ POUR SÉLECTIONNER</span>
          </div>
          <h3 className="text-3xl font-bold">
            PROPRIÉTAIRE
          </h3>
        </div>
        <div className={`p-6 rounded-xl ${selectedRole === 'renter' ? 'bg-[#3EFEFE] text-black' : 'bg-[#3EFEFE] text-black'}`} onClick={() => handleRoleSelect('renter')}>
          <div className="flex justify-between items-center mb-8">
            <div className={`w-6 h-6 rounded-full border-2 border-black ${selectedRole === 'renter' ? 'bg-black' : ''}`}></div>
            <span>CLIQUEZ POUR SÉLECTIONNER</span>
          </div>
          <h3 className="text-3xl font-bold">
            LOCATAIRE
          </h3>
        </div>
      </div>
      <div className="mt-auto flex justify-center py-8">
        {/* Navigation indicator */}
        <div className="w-20 h-1 bg-gray-300 rounded-full"></div>
      </div>
    </div>;
};
export default RoleSelectionPage;