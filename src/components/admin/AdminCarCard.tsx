import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Car {
  id: string;
  marque: string;
  modele: string;
  type: string;
  description: string;
  ville: string;
  sunroof: number;
  androidauto: number;
  clime: number;
  bluetooth: number;
  photofront: string;
  photoback: string;
  photoleft: string;
  photorigth: string;
  prix: number;
  prixhorszone?: number | null;
  avance: number;
  proprio: string;
  statut: number;
  fuel: string;
  comission: number;
}

interface AdminCarCardProps {
  car: Car;
}

const AdminCarCard: React.FC<AdminCarCardProps> = ({ car }) => {
  const [ownerName, setOwnerName] = useState<string>("");

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const ownerRes = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/owners/getOwner/${car.proprio}`);
        setOwnerName(ownerRes.data.fullname || ownerRes.data.fullName || "Propriétaire inconnu");
        console.log("Propriétaire récupéré :", ownerRes.data);  
      } catch {
        setOwnerName("Propriétaire inconnu");
      }
    };
    fetchOwner();
  }, [car.proprio]);

  // Statut : 1 = Disponible (vert), 2 = Louée (jaune), 0 ou autre = Indisponible (rouge)
  const getStatutLabel = () => {
    switch (car.statut) {
      case 1:
        return (
          <span className="px-2 py-1 text-xs rounded font-bold bg-green-100 text-green-800">
            Disponible
          </span>
        );
      case 2:
        return (
          <span className="px-2 py-1 text-xs rounded font-bold bg-yellow-100 text-yellow-800">
            Louée
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded font-bold bg-red-100 text-red-800">
            Indisponible
          </span>
        );
    }
  };

  return (
    <div className="bg-black rounded-lg shadow p-3 flex flex-col sm:flex-row gap-4 items-center mb-4 border border-gray-800">
      <div className="w-full sm:w-auto flex justify-center">
        {car.photofront ? (
          <img
            src={car.photofront}
            alt={`${car.marque} ${car.modele}`}
            className="h-32 w-full sm:w-40 object-cover rounded"
          />
        ) : (
          <div className="h-32 w-full sm:w-40 rounded bg-gray-800 flex items-center justify-center text-gray-400">
            Aucune photo
          </div>
        )}
      </div>
      <div className="flex-1 w-full">
        <h3 className="text-lg font-bold mb-1 text-[#3EFEFE]">{car.marque} {car.modele}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <p className="text-sm mb-1 text-white"><span className="font-bold text-[#3EFEFE]">Type :</span> {car.type}</p>
          <p className="text-sm mb-1 text-white"><span className="font-bold text-[#3EFEFE]">Ville :</span> {car.ville}</p>
          <p className="text-sm mb-1 text-white"><span className="font-bold text-[#3EFEFE]">Prix/jour :</span> {car.prix} FCFA</p>
          {car.prixhorszone !== undefined && car.prixhorszone !== null && (
            <p className="text-sm mb-1 text-white"><span className="font-bold text-[#3EFEFE]">Prix hors zone :</span> {car.prixhorszone} FCFA</p>
          )}
          <p className="text-sm mb-1 text-white">
            <span className="font-bold text-[#3EFEFE]">Statut :</span> {getStatutLabel()}
          </p>
          <p className="text-sm mb-1 text-white">
            <span className="font-bold text-[#3EFEFE]">Propriétaire :</span> {ownerName || "Chargement..."}
          </p>
        </div>
        <div className="flex gap-2 mt-2 overflow-x-auto">
          {car.photoback && (
            <img src={car.photoback} alt="Arrière" className="h-10 w-16 object-cover rounded" />
          )}
          {car.photoleft && (
            <img src={car.photoleft} alt="Gauche" className="h-10 w-16 object-cover rounded" />
          )}
          {car.photorigth && (
            <img src={car.photorigth} alt="Droite" className="h-10 w-16 object-cover rounded" />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCarCard;