import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { StarIcon, MapPinIcon, CarIcon, ShieldIcon, HeartIcon, ShareIcon, SunIcon, SmartphoneIcon, SnowflakeIcon, BluetoothIcon, FuelIcon, Settings } from 'lucide-react';
import axios from 'axios';
import CarReviews from "../../components/renter/CarReviews";
import { toast } from 'sonner';
import BookingCard from '../../components/renter/BookingCard';
import ErrorBoundary from '../../components/ErrorBoundary';
import { getAuth } from "firebase/auth";
import CalendarRenter from '../../components/renter/Calendar';

interface Car {
  id: string;
  marque: string;
  modele: string;
  type: string;
  description: string;
  ville: string;
  prix: string;
  prixhorszone?: string | number | null;
  avance: boolean;
  fuel: string;
  sunroof: boolean;
  androidauto: boolean;
  boiteVitesse: string;
  clime: boolean;
  bluetooth: boolean;
  comission: boolean;
  statut: boolean;
  proprio: string;
  photofront?: string;
  photoback?: string;
  photoleft?: string;
  photoright?: string;
}

interface Rules {
  fumer: boolean;
  animaux: boolean;
  age: number;
  livraison: number;
}

const VehicleView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  // Auth
  const auth = getAuth();
  const user = auth.currentUser;
  const conducteur = user ? user.uid : null;

  // Dates dynamiques
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  // Récupérer dynamiquement la dernière période du conducteur
  useEffect(() => {
    const fetchLastDateAuto = async () => {
      if (!conducteur) return;
      try {
        const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/dateautos/dateauto/last/${conducteur}`);
        if (res.data) {
          const now = new Date();
          const todayStr = now.toISOString().split('T')[0];
          const receivedStart = res.data.dateDebut ? new Date(res.data.dateDebut) : null;
          if (receivedStart && receivedStart < now) {
            setDateDebut(todayStr);
            setDateFin(todayStr);
          } else {
            setDateDebut(res.data.dateDebut || '');
            setDateFin(res.data.dateFin || '');
          }
        }
      } catch (err) {
        console.log('[DEBUG] Aucune période trouvée');
      }
    };
    fetchLastDateAuto();
  }, [conducteur]);

  const [car, setCar] = useState<Car | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [rules, setRules] = useState<Rules | null>(null);
  const [loading, setLoading] = useState(false);
  const [withLivraison, setWithLivraison] = useState(false);
  const [heurePrise, setHeurePrise] = useState("09:00");
  const [isLoading, setIsLoading] = useState(true);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [ratings, setRatings] = useState<any[]>([]);
  const [favoriId, setFavoriId] = useState<string | null>(null);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [modalRatings, setModalRatings] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [reservations, setReservations] = useState<any[]>([]);

  // Récupération du mode visite depuis le state de la navigation
  const visitMode = location.state?.visitMode || false;

  // Calcul des variables pour le prix
  const prixJour = Number(car?.prix) || 0;
  const nbJours = dateDebut && dateFin 
    ? Math.max(1, Math.ceil((new Date(dateFin).getTime() - new Date(dateDebut).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const livraisonMontant = withLivraison ? 2000 : 0; // Fixé à 2000 XAF
  const sousTotal = prixJour * nbJours;
  const total = sousTotal + livraisonMontant;

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const response = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/car/${id}`);
        setCar(response.data);

        if (response.data.proprio) {
          try {
            const rulesRes = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/regles/regle/${response.data.proprio}`);
            setRules(rulesRes.data);
          } catch (err) {
            console.log("Aucune règle spécifique trouvée");
            setRules({
              fumer: false,
              animaux: false,
              age: 21,
              livraison: 2000
            });
          }
        }
      } catch (err) {
        toast.error("Erreur lors du chargement du véhicule");
        navigate('/renter/search');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCar();
  }, [id, navigate]);

  useEffect(() => {
    const fetchRatings = async () => {
      if (!car?.id) return;
      try {
        const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/ratings/rating/voiture/${car.id}`);
        setRatings(res.data);
      } catch (err) {
        setRatings([]);
      }
    };
    fetchRatings();
  }, [car?.id]);

  useEffect(() => {
    const fetchFavori = async () => {
      if (!car?.id || !conducteur) return;
      try {
        const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/favoris/favoris/unique/${car.id}/${conducteur}`);
        setIsFavorite(true);
        setFavoriId(res.data.id);
      } catch (err) {
        setIsFavorite(false);
        setFavoriId(null);
      }
    };
    fetchFavori();
  }, [car?.id, conducteur]);

  useEffect(() => {
    if (!car?.id) return;
    const fetchReservations = async () => {
      try {
        const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/reservations/Allreservations/byCar/${car.id}`);
        setReservations(res.data);
      } catch (e) {
        toast.error('Erreur lors du chargement des réservations');
      }
    };
    fetchReservations();
  }, [car?.id]);

  // Fonction pour vérifier la disponibilité d'un véhicule sur la période choisie
  const checkDisponibilite = (dateDebut: string, dateFin: string) => {
    if (!car?.id || !dateDebut || !dateFin) return true;
    const start = new Date(dateDebut);
    const end = new Date(dateFin);
    const hasReservation = reservations.some(res => {
      const resStart = new Date(res.date_debut);
      const resEnd = new Date(res.date_fin);
      return (start <= resEnd && end >= resStart);
    });
    return !hasReservation;
  };

  const handleBooking = async () => {
    if (!car) return;

    if (!dateDebut || !dateFin) {
      toast.error("Veuillez sélectionner les dates.");
      return;
    }

    if (new Date(dateFin) <= new Date(dateDebut)) {
      toast.error("La date de fin doit être après la date de début");
      return;
    }

    if (!checkDisponibilite(dateDebut, dateFin)) {
      toast.error("Ce véhicule est déjà réservé sur cette période. Choisissez une autre date ou un autre véhicule.");
      return;
    }

    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const conducteur = user ? user.uid : null;
      if (!conducteur) {
        toast.error("Utilisateur non connecté.");
        setLoading(false);
        return;
      }
      const voiture = car.id;
      const proprietaire = car.proprio;
      const avance = car.avance ? 1 : 0;
      const caution = car.comission ? 1 : 0;
      const livraison = withLivraison ? 2000 : 0;
      const heuredeprise = heurePrise;
      const heurederetour = "18:00:00";
      const statut = 0;

      // Création de la réservation
      await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/reservations/reservation', {
        conducteur,
        voiture,
        proprietaire,
        date_debut: dateDebut,
        date_fin: dateFin,
        avance,
        caution,
        livraison,
        heuredeprise,
        heurederetour,
        totale: total,
        statut,
        latitude: withLivraison ? latitude : null,
        longitude: withLivraison ? longitude : null,
      });

      // Création des notifications
      try {
        // Notification pour le locataire
        await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/notifications/addNotification', {
          userId: conducteur,
          type: 'reservation',
          title: 'Nouvelle réservation',
          message: `Votre réservation du ${dateDebut} au ${dateFin} a été enregistrée.`,
          link: `/renter/booking/${car.id}`,
          meta: {
            voiture,
            dateDebut,
            dateFin,
            total,
            proprietaire
          }
        });

        // Notification pour le propriétaire
        await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/notifications/addNotification', {
          userId: proprietaire,
          type: 'reservation',
          title: 'Nouvelle réservation sur votre véhicule',
          message: `Votre véhicule (${car.marque} ${car.modele}) a été réservé du ${dateDebut} au ${dateFin} par un locataire.`,
          link: `/owner/reservations/${car.id}`,
          meta: {
            voiture,
            dateDebut,
            dateFin,
            total,
            conducteur
          }
        });
      } catch (notifErr) {
        console.error('[Notification] Erreur:', notifErr);
      }

      toast.success("Réservation effectuée !");
      navigate(`/renter/booking/${car.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la réservation");
    } finally {
      setLoading(false);
    }
  };

  const handleGetLocation = () => {
    setGeoLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setGeoLoading(false);
          toast.success("Position récupérée !");
        },
        (error) => {
          toast.error("Impossible de récupérer la position.");
          setGeoLoading(false);
        }
      );
    } else {
      toast.error("La géolocalisation n'est pas supportée.");
      setGeoLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!car?.id || !conducteur || !car.proprio) {
      toast.error("Impossible de gérer le favori (données manquantes).");
      return;
    }
    if (isFavorite) {
      // Suppression du favori
      if (!favoriId) {
        toast.error("Impossible de supprimer le favori (id manquant).");
        return;
      }
      try {
        await axios.delete(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/favoris/favoris/${favoriId}`);
        setIsFavorite(false);
        setFavoriId(null);
        toast.success("Favori supprimé !");
      } catch (err) {
        toast.error("Erreur lors de la suppression du favori.");
      }
      return;
    }
    // Ajout du favori
    try {
      const res = await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/favoris/favoris', {
        voiture: car.id,
        chauffeur: conducteur,
        proprio: car.proprio,
      });
      setIsFavorite(true);
      setFavoriId(res.data.id);
      toast.success("Ajouté aux favoris !");
    } catch (err) {
      toast.error("Erreur lors de l'ajout aux favoris.");
    }
  };

  // Ouvre le modal et charge les avis dynamiquement
  const handleOpenReviewsModal = async () => {
    if (!car?.id) return;
    setModalLoading(true);
    setShowReviewsModal(true);
    try {
      const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/ratings/rating/voiture/${car.id}`);
      setModalRatings(res.data);
    } catch (err) {
      setModalRatings([]);
    } finally {
      setModalLoading(false);
    }
  };

  const nbAvis = ratings.length;
  const moyenne = nbAvis > 0
    ? (ratings.reduce((sum, r) => sum + (Number(r.points) || 0), 0) / nbAvis).toFixed(1)
    : "—";

  // Slider d'images
  const images = car ? [car.photofront, car.photoback, car.photoleft, car.photoright].filter(Boolean) : [];
  const [current, setCurrent] = useState(0);
  const totalImages = images.length;
  const touchStart = React.useRef<number | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStart.current;
    if (diff > 40 && current > 0) setCurrent(current - 1);
    if (diff < -40 && current < totalImages - 1) setCurrent(current + 1);
    touchStart.current = null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Véhicule introuvable</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Image gallery */}
      <div className="relative">
        <div 
          className="h-64 md:h-[500px] bg-black select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {images.length > 0 ? (
            <img
              src={images[current]}
              alt={car.marque + ' ' + car.modele}
              className="h-full w-full object-cover object-center"
              draggable={false}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-400">Aucune image</div>
          )}
          
          {totalImages > 1 && (
            <>
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1 text-black hover:bg-white"
                onClick={(e) => { e.stopPropagation(); setCurrent(c => Math.max(0, c - 1)); }}
                disabled={current === 0}
                style={{ zIndex: 2 }}
              >
                {'<'}
              </button>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1 text-black hover:bg-white"
                onClick={(e) => { e.stopPropagation(); setCurrent(c => Math.min(totalImages - 1, c + 1)); }}
                disabled={current === totalImages - 1}
                style={{ zIndex: 2 }}
              >
                {'>'}
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, i) => (
                  <span 
                    key={i} 
                    className={`w-2 h-2 rounded-full ${i === current ? 'bg-[#3EFEFE]' : 'bg-white/60'} block`}
                  ></span>
                ))}
              </div>
            </>
          )}
        </div>
        
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
          <button 
            onClick={() => navigate('/renter/search')} 
            className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            ← Retour
          </button>
          <div className="flex gap-2">
            <button 
              onClick={handleToggleFavorite} 
              className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
              title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              <HeartIcon size={20} className={isFavorite ? 'fill-[#3EFEFE] text-[#3EFEFE]' : ''} />
            </button>
            <button className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70">
              <ShareIcon size={20} />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-2 md:px-8 py-6">
        {/* Vehicle details card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold">{car.marque} {car.modele}</h1>
              <div className="flex items-center gap-2 text-gray-600 mt-1">
                <MapPinIcon size={16} />
                <span>{car.ville}</span>
              </div>
              <div className="flex items-center gap-1 mt-2 cursor-pointer" onClick={handleOpenReviewsModal} title="Voir les avis">
                <StarIcon className="text-yellow-400" size={20} />
                <span className="font-bold">{moyenne}</span>
                <span className="text-gray-600">
                  ({nbAvis} {nbAvis === 1 ? "avis" : "avis"})
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-[#3EFEFE]">{Number(car.prix).toLocaleString()} FCFA</p>
              {car.prixhorszone !== undefined && car.prixhorszone !== null && (
                <p className="text-sm text-gray-500">Prix hors zone: {Number(car.prixhorszone).toLocaleString()} FCFA</p>
              )}
              <p className="text-gray-600">par jour</p>
            </div>
          </div>

          <div className="border-t border-b py-6 my-6">
            <h2 className="text-xl font-bold mb-4">Description</h2>
            <p className="text-gray-600">{car.description || "Aucune description disponible"}</p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Caractéristiques</h2>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-black border-black">
                <CarIcon size={18} className="text-[#3EFEFE]" />
                <span className="text-[#3EFEFE]">{car.type}</span>
              </div>

              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${car.clime ? 'bg-black border-black' : 'border-gray-300 bg-gray-50'}`}>
                <SnowflakeIcon size={18} className={car.clime ? 'text-[#3EFEFE]' : 'text-gray-400'} />
                <span className={car.clime ? 'text-[#3EFEFE]' : 'text-gray-400'}>Climatisation</span>
              </div>

              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${car.bluetooth ? 'bg-black border-black' : 'border-gray-300 bg-gray-50'}`}>
                <BluetoothIcon size={18} className={car.bluetooth ? 'text-[#3EFEFE]' : 'text-gray-400'} />
                <span className={car.bluetooth ? 'text-[#3EFEFE]' : 'text-gray-400'}>Bluetooth</span>
              </div>

              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${car.androidauto ? 'bg-black border-black' : 'border-gray-300 bg-gray-50'}`}>
                <SmartphoneIcon size={18} className={car.androidauto ? 'text-[#3EFEFE]' : 'text-gray-400'} />
                <span className={car.androidauto ? 'text-[#3EFEFE]' : 'text-gray-400'}>Android Auto</span>
              </div>

              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${car.sunroof ? 'bg-black border-black' : 'border-gray-300 bg-gray-50'}`}>
                <SunIcon size={18} className={car.sunroof ? 'text-[#3EFEFE]' : 'text-gray-400'} />
                <span className={car.sunroof ? 'text-[#3EFEFE]' : 'text-gray-400'}>Toit ouvrant</span>
              </div>

              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                car.boiteVitesse === 'Manuel' ? 'bg-violet-100 border-violet-200' :
                car.boiteVitesse === 'Auto' ? 'bg-[#3EFEFE] border-[#3EFEFE]' :
                'border-gray-300 bg-gray-50'
              }`}>
                <Settings size={18} className={car.boiteVitesse === 'Manuel' ? 'text-violet-700' : car.boiteVitesse === 'Auto' ? 'text-black' : 'text-gray-400'} />
                <span className={car.boiteVitesse === 'Manuel' ? 'text-violet-700' : car.boiteVitesse === 'Auto' ? 'text-black' : 'text-gray-400'}>
                  {car.boiteVitesse || 'Non renseigné'}
                </span>
              </div>

              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                car.fuel === 'Essence' ? 'bg-violet-100 border-violet-200' :
                car.fuel === 'Gazole' ? 'bg-[#3EFEFE] border-[#3EFEFE]' :
                'border-gray-300 bg-gray-50'
              }`}>
                <FuelIcon size={18} className={car.fuel === 'Essence' ? 'text-violet-700' : car.fuel === 'Gazole' ? 'text-black' : 'text-gray-400'} />
                <span className={car.fuel === 'Essence' ? 'text-violet-700' : car.fuel === 'Gazole' ? 'text-black' : 'text-gray-400'}>
                  {car.fuel || 'Non renseigné'}
                </span>
              </div>

              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                car.statut ? 'bg-[#fee2e2] border-[#fee2e2]' : 'bg-[#3EFEFE] border-[#3EFEFE]'
              }`}>
                <ShieldIcon size={18} className={car.statut ? 'text-red-600' : 'text-black'} />
                <span className={car.statut ? 'text-red-600' : 'text-black'}>
                  {car.statut ? 'En location' : 'Disponible'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Règles */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Règles de location</h2>
          {rules ? (
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>{rules.fumer ? "Fumer autorisé dans le véhicule" : "Pas de fumer dans le véhicule"}</li>
              <li>{rules.animaux ? "Animaux acceptés à bord" : "Pas d'animaux à bord"}</li>
              <li>Âge minimum : {rules.age} ans</li>
              <li>Livraison : 2 000 XAF</li>
              <li>Restitution du véhicule avec le plein</li>
            </ul>
          ) : (
            <p className="text-gray-600">Aucune règle spécifique pour ce véhicule.</p>
          )}
        </div>

        {/* Booking card */}
        <ErrorBoundary>
          <BookingCard
            key={`booking-${car.id}`} // Ajout d'une clé unique pour forcer le re-render
            statut={car.statut}
            dateDebut={dateDebut}
            setDateDebut={setDateDebut}
            dateFin={dateFin}
            setDateFin={setDateFin}
            withLivraison={withLivraison}
            setWithLivraison={setWithLivraison}
            latitude={latitude}
            longitude={longitude}
            geoLoading={geoLoading}
            onGetLocation={handleGetLocation}
            heurePrise={heurePrise}
            setHeurePrise={setHeurePrise}
            nbJours={nbJours}
            prixJour={prixJour}
            sousTotal={sousTotal}
            rules={{
              ...rules,
              livraison: 2000
            } as Rules}
            total={total}
            loading={loading}
            handleBooking={handleBooking}
            visitMode={visitMode}
          />
        </ErrorBoundary>

        {/* Section calendrier des entretiens */}
        {car?.id && (
          <section className="my-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-2 text-blue-900">Entretiens programmés</h2>
            <div key={`calendar-${car.id}`}>
              <CalendarRenter carId={car.id} />
            </div>
          </section>
        )}

        {/* Modal pour les avis */}
        {showReviewsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl font-bold"
                onClick={() => setShowReviewsModal(false)}
                aria-label="Fermer"
                type="button"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-4">Avis sur ce véhicule</h2>
              <CarReviews ratings={modalRatings} ratingsLoading={modalLoading} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default VehicleView;