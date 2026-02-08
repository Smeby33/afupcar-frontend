import React from 'react';

interface MapLivraisonProps {
  latitude: string;
  longitude: string;
  renterFullname: string;
  renterPhoto?: string;
  id_reservation?: string;
  conducteur?: string;
  voiture?: string;
  onStartLivraison?: () => void;
  startLoading?: boolean;
  startSuccess?: boolean;
  startError?: string;
}

const MapLivraison: React.FC<MapLivraisonProps> = ({
  latitude,
  longitude,
  renterFullname,
  renterPhoto,
  id_reservation,
  conducteur,
  voiture,
  onStartLivraison,
  startLoading,
  startSuccess,
  startError,
}) => {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const mapUrl = `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`;

  if (isNaN(lat) || isNaN(lng)) {
    return <div>Coordonnées invalides</div>;
  }

  return (
    <div className="w-full rounded overflow-hidden border mt-4 mb-4 relative"  style={{ height: '400px' }}>
      <iframe
        title="Carte de livraison"
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
      <div className="absolute bottom-1 left-2 flex items-center gap-2 bg-white bg-opacity-80 rounded px-2 py-1 shadow">
        {renterPhoto && <img src={renterPhoto} alt="Conducteur" className="w-8 h-8 rounded-full object-cover border" />}
        <span className="font-semibold text-gray-700 text-sm">{renterFullname}</span>
      </div>
      {/* Bouton Commencer la livraison */}
      {id_reservation && conducteur && voiture && onStartLivraison && (
        <div className="absolute left-2 bottom-2">
          <button
            onClick={onStartLivraison}
            disabled={startLoading || startSuccess}
            className={`px-4 py-2 rounded bg-[#3EFEFE] text-black font-bold shadow hover:bg-[#b6e62e] transition ${startLoading ? 'opacity-60' : ''}`}
          >
            {startSuccess ? 'Livraison commencée !' : startLoading ? 'Démarrage...' : 'Commencer la livraison'}
          </button>
          {startError && <div className="text-red-600 text-xs mt-1">{startError}</div>}
        </div>
      )}
    </div>
  );
};

export default MapLivraison;
