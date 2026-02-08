import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CarIcon, CheckCircleIcon } from 'lucide-react';

interface VehicleCardProps {
  name: string;
  price: number;
  prixhorszone?: number | null;
  images: string[]; // tableau d'urls d'images
  statut: boolean;
  id?: string;
  ville: string;
  fuel: string;
  visitMode?: boolean;
  onClick?: () => void;
}

const VehicleCardRenter: React.FC<VehicleCardProps> = ({
  name,
  price,
  prixhorszone,
  images,
  statut,
  id,
  fuel,
  visitMode = false,
  onClick
}) => {
  const [current, setCurrent] = React.useState(0);
  const total = images.length;
  const navigate = useNavigate();

  let fuelBg = "bg-gray-100 text-gray-700";
  if (fuel === "Essence") fuelBg = "bg-violet-100 text-violet-700";
  if (fuel === "Gazole") fuelBg = "bg-[#3EFEFE] text-black";

  // Gestion du swipe (mobile)
  const touchStart = React.useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStart.current;
    if (diff > 40 && current > 0) setCurrent(current - 1);
    if (diff < -40 && current < total - 1) setCurrent(current + 1);
    touchStart.current = null;
  };

  return (
    <div
      className="bg-white rounded-lg shadow overflow-hidden cursor-pointer transform transition-transform hover:scale-[1.02] mb-6"
      onClick={onClick}
    >
      <div
        className="h-48 bg-black relative select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={images[current]}
          alt={name}
          className="h-full w-full object-cover object-center"
          draggable={false}
        />
        {/* Flèches navigation desktop */}
        {total > 1 && (
          <>
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1 text-black hover:bg-white"
              onClick={e => { e.stopPropagation(); setCurrent(c => Math.max(0, c - 1)); }}
              disabled={current === 0}
              style={{ zIndex: 2 }}
            >
              {'<'}
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1 text-black hover:bg-white"
              onClick={e => { e.stopPropagation(); setCurrent(c => Math.min(total - 1, c + 1)); }}
              disabled={current === total - 1}
              style={{ zIndex: 2 }}
            >
              {'>'}
            </button>
            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <span key={i} className={`w-2 h-2 rounded-full ${i === current ? 'bg-[#3EFEFE]' : 'bg-white/60'} block`}></span>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="p-2">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold text-sm">{name}</h4>
            <p className="text-gray-600 text-sm">{price.toLocaleString()} XAF/J</p>
            {prixhorszone !== undefined && prixhorszone !== null && (
              <p className="text-xs text-gray-500">Hors zone: {prixhorszone.toLocaleString()} XAF</p>
            )}
          </div>
          <div className="flex flex-col items-end">
            <span
              className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${fuelBg}`}
            >
               {fuel || 'Non renseigné'}
            </span>
          </div>
        </div>
        {/* Bouton Réserver désactivé si visitMode actif */}
        {/* <button
          className={`mt-4 w-full px-4 py-2 rounded ${visitMode ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#3EFEFE] text-black hover:bg-[#c0e636]'}`}
          disabled={visitMode}
          onClick={e => {
            e.stopPropagation();
            if (!visitMode && onClick) onClick();
          }}
        >
          {visitMode ? 'Réservation désactivée (mode visite)' : 'Réserver'}
        </button> */}
      </div>
    </div>
  );
};

export default VehicleCardRenter;