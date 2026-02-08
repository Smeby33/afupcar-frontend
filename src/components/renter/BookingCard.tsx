import { ShieldIcon, CalendarIcon } from 'lucide-react';
import Button from '../../components/ui/Button';
import { toast } from 'sonner';

interface BookingCardProps {
  statut: boolean;
  dateDebut: string;
  setDateDebut: (v: string) => void;
  dateFin: string;
  setDateFin: (v: string) => void;
  withLivraison: boolean;
  setWithLivraison: (v: boolean) => void;
  heurePrise: string;
  setHeurePrise: (v: string) => void;
  nbJours: number;
  prixJour: number;
  sousTotal: number;
  rules?: { livraison?: number };
  total: number;
  loading: boolean;
  handleBooking: () => void;
  geoLoading: boolean;
  onGetLocation: () => void;
  latitude?: number;
  longitude?: number;
  visitMode?: boolean;
}

// Fonction utilitaire pour formater la date en jj/mm/aaaa
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const BookingCard: React.FC<BookingCardProps> = (props) => {
  try {
    const {
      statut,
      dateDebut,
      setDateDebut,
      dateFin,
      setDateFin,
      withLivraison,
      setWithLivraison,
      heurePrise,
      setHeurePrise,
      nbJours,
      prixJour,
      sousTotal,
      rules,
      total,
      loading,
      handleBooking,
      geoLoading,
      onGetLocation,
      latitude,
      longitude,
      visitMode = false,
    } = props;

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-20 md:mb-6">
        <div className={`flex items-center gap-2 p-3 rounded-lg mb-6
          ${statut
            ? 'text-orange-600 bg-orange-50'
            : 'text-green-600 bg-green-50'
          }`
        }>
          <ShieldIcon size={20} />
          <span className="text-sm">
            {statut
              ? 'Réservation disponible jours à venir'
              : 'Réservation instantanée disponible'}
          </span>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 mb-2">Date de début</label>
              <input
                type="date"
                className="w-full px-4 py-2 border rounded-lg"
                value={dateDebut}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setDateDebut(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-2">Date de fin</label>
              <input
                type="date"
                className="w-full px-4 py-2 border rounded-lg"
                value={dateFin}
                min={dateDebut || new Date().toISOString().split('T')[0]}
                onChange={e => setDateFin(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="withLivraison"
              checked={withLivraison}
              onChange={() => setWithLivraison(!withLivraison)}
              className="mr-2"
            />
            <label htmlFor="withLivraison" className="text-gray-600">
              Je souhaite la livraison du véhicule
            </label>
          </div>

          {withLivraison && (
            <div className="mt-2">
              <button
                type="button"
                onClick={onGetLocation}
                disabled={geoLoading}
                className="px-4 py-2 rounded bg-[#3EFEFE] text-black font-semibold"
              >
                {geoLoading ? "Récupération..." : "Récupérer ma position"}
              </button>
              {latitude && longitude && (
                <div className="text-xs text-gray-600 mt-1">
                  Position : {latitude.toFixed(5)}, {longitude.toFixed(5)}
                </div>
              )}
            </div>
          )}

          <div className="mt-2">
            <label className="block text-gray-600 mb-2">Heure de prise</label>
            <input
              type="time"
              className="w-full px-4 py-2 border rounded-lg"
              value={heurePrise}
              onChange={e => setHeurePrise(e.target.value)}
            />
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between text-gray-600 mb-2">
              <span>{nbJours} jour{nbJours > 1 ? 's' : ''} x {prixJour.toLocaleString()} FCFA</span>
              <span>{sousTotal.toLocaleString()} FCFA</span>
            </div>
            {withLivraison && rules?.livraison && (
              <div className="flex justify-between text-gray-600 mb-2">
                <span>Livraison</span>
                <span>{rules.livraison.toLocaleString()} FCFA</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{total.toLocaleString()} FCFA</span>
            </div>
          </div>

          <Button
            onClick={() => {
              const todayStr = new Date().toISOString().split('T')[0];
              if (dateDebut === todayStr && dateFin === todayStr) {
                toast.error('Veuillez vérifier les dates de la période choisie.');
                return;
              }
              console.log('[LOG] BookingCard - dateDebut:', dateDebut, 'dateFin:', dateFin);
              handleBooking();
            }}
            disabled={loading || !dateDebut || !dateFin || visitMode}
            fullWidth
            className="!text-lg"
          >
            {visitMode ? 'Réservation désactivée (mode visite)' : (loading ? 'Traitement...' : 'Réserver maintenant')}
          </Button>
        </div>
      </div>
    );
  } catch (error) {
    console.error('[BookingCard] Render error caught:', error);
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-20 md:mb-6">
        <div className="text-sm text-red-600">Une erreur est survenue dans la carte de réservation.</div>
      </div>
    );
  }
};

export default BookingCard;