import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CarIcon, CheckCircleIcon, Calendar, Fuel } from 'lucide-react';

interface VehicleCardProps {
  name: string;
  price: number;
  prixhorszone?: number | null;
  image: string;
  status: 'disponible' | 'consommation' | 'confirmed';
  id?: string;
  type?: string;
  fuel?: string;
}

const VehicleCard: React.FC<VehicleCardProps> = ({
  name,
  price,
  prixhorszone,
  image,
  status,
  id,
  type,
  fuel,
}) => {
  const navigate = useNavigate();
  
  // Configuration des badges
  const statusConfig = {
    disponible: { 
      color: 'bg-green-100 text-green-800 border border-green-200',
      text: 'Disponible',
      icon: <CheckCircleIcon size={14} className="mr-1" />
    },
    consommation: { 
      color: 'bg-orange-100 text-orange-800 border border-orange-200',
      text: 'En location',
      icon: <Calendar size={14} className="mr-1" />
    },
    confirmed: { 
      color: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      text: 'Réservée',
      icon: <Calendar size={14} className="mr-1" />
    }
  };

  const config = statusConfig[status] || statusConfig.disponible;

  return (
    <div
      className="group bg-white rounded-xl shadow-lg hover:shadow-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] border border-gray-100"
      onClick={() => navigate(`/owner/vehicle/${id}`)}
    >
      {/* Image avec overlay au hover */}
      <div className="relative h-48 overflow-hidden">
        <div
          className="h-full w-full bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
          style={{ backgroundImage: `url(${image})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Badge de statut en haut à droite */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${config.color}`}>
            {config.icon}
            {config.text}
          </span>
        </div>
      </div>

      {/* Contenu de la carte */}
      <div className="p-5">
        {/* En-tête avec nom et prix */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">{name}</h3>
            {type && (
              <p className="text-sm text-gray-500 mt-1 flex items-center">
                <CarIcon size={14} className="mr-2" />
                {type}
              </p>
            )}
          </div>
          
          {/* Prix bien mis en valeur */}
          <div className="text-right">
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-gray-900">{price.toLocaleString()}</span>
              <span className="text-sm text-gray-500 ml-1">XAF/J</span>
            </div>
            {prixhorszone !== undefined && prixhorszone !== null && (
              <p className="text-xs text-gray-500 mt-1">
                Hors zone: <span className="font-semibold">{prixhorszone.toLocaleString()} XAF</span>
              </p>
            )}
          </div>
        </div>

        {/* Informations supplémentaires */}
        {(fuel) && (
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center text-sm text-gray-600">
              {fuel && (
                <div className="flex items-center mr-4">
                  <Fuel size={14} className="mr-2 text-gray-400" />
                  <span>{fuel}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Indicateur de clic */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center group-hover:text-blue-500 transition-colors">
            Cliquer pour voir les détails
          </p>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;