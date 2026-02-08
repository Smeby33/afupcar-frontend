import React from 'react';

interface Owner {
  id: string;
  fullname: string;
  email: string;
  phone: string;
  companyname: string;
  picture: string;
  adresse: string;
  numeronif: string;
  documentcni: string;
  latitude: string;
  longitude: string;
}

interface AdminOwnerCardProps {
  owner: Owner;
}

const AdminOwnerCard: React.FC<AdminOwnerCardProps> = ({ owner }) => {
  if (!owner) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Aucun propriétaire trouvé
      </div>
    );
  }

  return (
    <div className="bg-black rounded-lg shadow p-6 flex flex-col md:flex-row gap-6 items-center border border-gray-800">
      <div>
        {owner.picture ? (
          <img src={owner.picture} alt="photo entreprise" className="h-24 w-24 rounded-full object-cover" />
        ) : (
          <div className="h-24 w-24 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
            Aucune photo
          </div>
        )}
      </div>
      <div className="flex-1 text-white">
        <h2 className="text-xl font-bold mb-2 text-[#3EFEFE]">{owner.companyname}</h2>
        <p className="mb-1"><span className="font-bold text-[#3EFEFE]">Propriétaire :</span> {owner.fullname}</p>
        <p className="mb-1"><span className="font-bold text-[#3EFEFE]">Email :</span> {owner.email}</p>
        <p className="mb-1"><span className="font-bold text-[#3EFEFE]">Téléphone :</span> {owner.phone}</p>
        <p className="mb-1"><span className="font-bold text-[#3EFEFE]">Adresse :</span> {owner.adresse}</p>
        <p className="mb-1"><span className="font-bold text-[#3EFEFE]">NIF :</span> {owner.numeronif}</p>
        <p className="mb-1"><span className="font-bold text-[#3EFEFE]">Localisation :</span> {owner.latitude}, {owner.longitude}</p>
        <p className="mb-1">
          <span className="font-bold text-[#3EFEFE]">CNI :</span>{' '}
          {owner.documentcni ? (
            <a href={owner.documentcni} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
              Voir le document
            </a>
          ) : (
            <span className="text-gray-400">Aucun</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default AdminOwnerCard;