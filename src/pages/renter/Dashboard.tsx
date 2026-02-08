import React, { useEffect, useState } from 'react';
import { getAuth } from "firebase/auth";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CarIcon, ClockIcon, StarIcon ,LayoutDashboardIcon, UserIcon } from 'lucide-react';
import AvisForm from "../../components/renter/AvisForm";
import CarReviews from '../../components/renter/CarReviews';

const RenterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<any[]>([]);
  const [cars, setCars] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(true);
  const [showAvisForm, setShowAvisForm] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);

  // DÉCLARE LA FONCTION ICI, AVANT TOUT FILTRE
  const getReservationStatus = (statut: number, dateDebut: string, dateFin: string) => {
    const today = new Date();
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);

    if (statut === 1 && today >= debut && today <= fin) return 'consommation';
    if (statut === 1 && fin < today) return 'completed';
    if (statut === 0 && fin < today) return 'cancelled';
    if (statut === 1) return 'confirmed';
    return 'pending';
  };

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        const conducteur = user ? user.uid : null;
        if (!conducteur) return;
        const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/reservations/conducteur/${conducteur}`);
        setReservations(res.data);
        console.log(res.data);

        // Après setReservations(res.data);
        const carIds = Array.from(new Set(res.data.map((r: any) => r.voiture)));
        const carsData: { [key: string]: any } = {};
        await Promise.all(
          carIds.map(async (carId) => {
            try {
              const carRes = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/car/${carId}`);
              carsData[carId] = carRes.data;
            } catch (e) {
              // Si la voiture n'est pas trouvée, on laisse vide
              carsData[carId] = null;
            }
          })
        );
        setCars(carsData);
      } catch (err) {
        setReservations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

  // Date du jour (sans l'heure)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Réservations actives (statut "consommation")
  const activeReservations = reservations.filter(
    r => getReservationStatus(r.statut, r.date_debut, r.date_fin) === 'consommation'
  );

  // Réservations en attente (statut "pending")
  const pendingCount = reservations.filter(
    r => getReservationStatus(r.statut, r.date_debut, r.date_fin) === 'pending'
  ).length;

  // Historique (exemple : toutes les réservations terminées)
  const history = reservations.filter(r => new Date(r.date_fin) < today);

  const ongoing = reservations
    .filter(r => getReservationStatus(r.statut, r.date_debut, r.date_fin) === 'consommation')
    .slice(0, 3);

  const upcoming = reservations
    .filter(r => {
      const status = getReservationStatus(r.statut, r.date_debut, r.date_fin);
      return status === 'confirmed' || status === 'pending';
    })
    .slice(0, 3);

  const historyList = reservations
    .filter(r => {
      const status = getReservationStatus(r.statut, r.date_debut, r.date_fin);
      return status === 'completed' || status === 'cancelled';
    })
    .slice(0, 3);

  return <div className="min-h-screen bg-gray-100">
      <header className="bg-gray-100 text-white p-6">
        <div className="max-w-6xl mx-auto">
          {/* <h1 className="text-2xl font-bold">Mes réservations</h1> */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-900 rounded-lg p-2">
              <div className="flex items-center gap-3">
                <CarIcon className="text-[#3EFEFE]" />
                <div>
                  <p className=" text-sm text-gray-400">Réservations actives</p>
                  <p className="text-1xl font-bold">{activeReservations.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-2">
              <div className="flex items-center gap-3">
                <ClockIcon className="text-[#3EFEFE]" />
                <div>
                  <p className="text-sm text-gray-400">En attente</p>
                  <p className="text-1xl font-bold">{pendingCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-2">
              <div className="flex items-center gap-3">
                <StarIcon className="text-[#3EFEFE]" />
                <div>
                  <p className="text-sm text-gray-400">Avis donnés</p>
                  <p className="text-1xl font-bold">{history.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-6">
        <div className="space-y-6">
          <section>
            <h3 className="text-xl font-bold mb-4">Réservation en cours</h3>
            {ongoing.length > 0 ? (
              ongoing.map(r => {
                const car = cars[r.voiture];
                return (
                  <div key={r.id} className="bg-white rounded-lg shadow overflow-hidden px-2 py-2 mb-3">
                    <div className="px-2 py-1 flex flex-col md:flex-row gap-6">
                      <div
                        className="w-full md:w-48 h-48 bg-cover bg-center rounded-lg cursor-pointer"
                        style={{
                          backgroundImage: `url(${car?.photofront || 'https://images.unsplash.com/photo-1441148345475-03a2e82f9719?ixlib=rb-4.0.3'})`
                        }}
                        onClick={() => { setSelectedCarId(car?.id); setShowReviewsModal(true); }}
                        title="Voir les avis sur ce véhicule"
                      ></div>
                      <div className="flex-1 mt-1">
                        {/* Titre de la réservation */}
                        <div className="flex items-center gap-3">
                        <h3 className="text-sm font-bold ">{car ? `${car.marque} ${car.modele}` : r.voiture}</h3>
                         {/* Statut de la réservation */}
                        <div className="mt-1">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
                              ${
                                getReservationStatus(r.statut, r.date_debut, r.date_fin) === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                : getReservationStatus(r.statut, r.date_debut, r.date_fin) === 'confirmed'
                                  ? 'bg-green-100 text-green-800'
                                : getReservationStatus(r.statut, r.date_debut, r.date_fin) === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                : getReservationStatus(r.statut, r.date_debut, r.date_fin) === 'completed'
                                  ? 'bg-blue-100 text-blue-800'
                                : getReservationStatus(r.statut, r.date_debut, r.date_fin) === 'consommation'
                                  ? 'bg-purple-100 text-purple-800'
                                : ''
                              }`
                            }
                          >
                            {getReservationStatus(r.statut, r.date_debut, r.date_fin) === 'pending' && 'En attente'}
                            {getReservationStatus(r.statut, r.date_debut, r.date_fin) === 'confirmed' && 'Confirmée'}
                            {getReservationStatus(r.statut, r.date_debut, r.date_fin) === 'cancelled' && 'Annulée'}
                            {getReservationStatus(r.statut, r.date_debut, r.date_fin) === 'completed' && 'Terminée'}
                            {getReservationStatus(r.statut, r.date_debut, r.date_fin) === 'consommation' && 'En cours de consommation'}
                          </span>
                        </div>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">
                          {new Date(r.date_debut).toLocaleDateString()} - {new Date(r.date_fin).toLocaleDateString()}
                        </p>
                       
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-sm font-bold">{Number(r.totale).toLocaleString()}  XAF</p>
                          <button
                            variant="primary"
                            className="py-1 px-2 text-sm rounded border-2 border-[#3EFEFE] bg-black text-[#f7ffe0] font-semibold hover:bg-[#e6f7b8] transition"
                            style={{ backgroundColor: '#3EFEFE', color: '#000', borderColor: '#3EFEFE',borderRadius: '0.375rem' }}
                            onClick={() => navigate(`/renter/booking/${r.voiture}`)}
                          >
                            Voir les détails
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500">Aucune réservation en cours.</p>
            )}
          </section>
          <section>
            <h3 className="text-xl font-bold mb-4">Réservations à venir</h3>
            <div className="space-y-4">
              {upcoming.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <p className="text-gray-600 mb-4">Aucune réservation à venir.</p>
                  <button variant="primary" onClick={() => navigate('/renter/search')}>
                    Louer une voiture
                  </button>
                </div>
              ) : (
                upcoming.map(r => {
                  const car = cars[r.voiture];
                  return (
                    <div key={r.id} className="bg-white rounded-lg shadow px-2 py-2">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div
                          className="w-full md:w-48 h-48 bg-cover bg-center rounded-lg"
                          style={{
                            backgroundImage: `url(${car?.photofront || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3'})`
                          }}
                        ></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-sm font-bold">{car ? `${car.marque} ${car.modele}` : r.voiture}</h3>
                            {/* Badge de statut */}
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
                                ${
                                  getReservationStatus(r.statut, r.date_debut, r.date_fin) === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                  : getReservationStatus(r.statut, r.date_debut, r.date_fin) === 'confirmed'
                                    ? 'bg-green-100 text-green-800'
                                  : getReservationStatus(r.statut, r.date_debut, r.date_fin) === 'cancelled'
                                    ? 'bg-red-100 text-red-800'
                                  : getReservationStatus(r.statut, r.date_debut, r.date_fin) === 'completed'
                                    ? 'bg-blue-100 text-blue-800'
                                  : getReservationStatus(r.statut, r.date_debut, r.date_fin) === 'consommation'
                                    ? 'bg-purple-100 text-purple-800'
                                  : ''
                                }`
                              }
                            >
                              {getReservationStatus(r.statut, r.date_debut, r.date_fin) === 'pending' && 'En attente'}
                              {getReservationStatus(r.statut, r.date_debut, r.date_fin) === 'confirmed' && 'Confirmée'}
                              {getReservationStatus(r.statut, r.date_debut, r.date_fin) === 'cancelled' && 'Annulée'}
                              {getReservationStatus(r.statut, r.date_debut, r.date_fin) === 'completed' && 'Terminée'}
                              {getReservationStatus(r.statut, r.date_debut, r.date_fin) === 'consommation' && 'En cours de consommation'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mt-1">
                            {new Date(r.date_debut).toLocaleDateString()} - {new Date(r.date_fin).toLocaleDateString()}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-sm font-bold">{Number(r.totale).toLocaleString()} XAF</p>
                            <button
                              variant="secondary"
                               className="py-1 px-2 text-sm rounded border-2 border-[#3EFEFE] bg-black text-[#f7ffe0] font-semibold hover:bg-[#e6f7b8] transition"
                            style={{ backgroundColor: '#3EFEFE', color: '#000', borderColor: '#3EFEFE',borderRadius: '0.375rem' }}
                            
                              onClick={() => navigate(`/renter/booking/${r.voiture}`)}
                            >
                              Voir les détails
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
          <section style={{ marginTop: '2rem', marginBottom: '4rem' }}>
            <h3 className="text-xl font-bold mb-4">Historique</h3>
            <div className="space-y-4">
              {historyList.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <p className="text-gray-600">Aucun historique pour le moment.</p>
                </div>
              ) : (
                historyList.map(r => {
                  const car = cars[r.voiture];
                  return (
                    <div key={r.id} className="bg-white rounded-lg shadow px-2 py-2">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div
                          className="w-full md:w-48 h-48 bg-cover bg-center rounded-lg"
                          style={{
                            backgroundImage: `url(${car?.photofront || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3'})`
                          }}
                        ></div>
                        <div className="flex-1">
                          <h3 className="text-sm font-bold">{car ? `${car.marque} ${car.modele}` : r.voiture}</h3>
                          <p className="text-gray-600 text-sm mt-1">
                            {new Date(r.date_debut).toLocaleDateString()} - {new Date(r.date_fin).toLocaleDateString()}
                          </p>
                          <div className="flex justify-between items-center mt-4">
                            <p className="text-sm font-bold">{Number(r.totale).toLocaleString()} XAF</p>
                            <button
                              type="button"
                              className="py-1 px-2 text-sm rounded border-2 border-[#3EFEFE] bg-[#f7ffe0] text-black font-semibold hover:bg-[#e6f7b8] transition"
                              onClick={() => {
                                if (!car?.id || !r?.proprietaire || !r?.conducteur) {
                                  alert("Informations du véhicule ou du conducteur manquantes.");
                                  console.log("les informations manquantes", { 
                                    id_reservation: r?.id,
                                    voiture: car?.id,
                                    proprietaire: car?.proprietaire,
                                    conducteur: r?.conducteur,
                                    date_debut: r.date_debut,
                                  date_fin: r.date_fin,
                                  });
                                  return;
                                }
                                setSelectedReservation({
                                  id_reservation: r.id,
                                  voiture: car.id,
                                  conducteur: r.conducteur,
                                  date_debut: r.date_debut,
                                  date_fin: r.date_fin,
                                });
                                setShowAvisForm(true);
                                console.log("selectedReservation :", {
                                  id_reservation: r.id,
                                  voiture: car.id,
                                  conducteur: r.conducteur,
                                  date_debut: r.date_debut,
                                  date_fin: r.date_fin,
                                });
                              }}
                            >
                              Donner un avis
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </main>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-[#222]" style={{ borderRadius: '40px 40px 40px 40px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',margin: '0 2px 15px 2px',borderBlockColor: '#222' }}>
        <div className="flex justify-around p-3">
          <button  onClick={() => navigate('/renter/dashboard')} className="flex flex-col items-center gap-1 text-[#3EFEFE]">
            <LayoutDashboardIcon size={18} />
            <span className="text-xs font-semibold">Dashboard</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white hover:text-[#3EFEFE]"
            onClick={() => navigate('/renter/search')}>
            <CarIcon size={18} />
            <span className="text-xs">Recherche</span>
          </button>
          <button onClick={() => navigate('/renter/reservations')} className="flex flex-col items-center gap-1 text-white hover:text-[#3EFEFE]">
            <ClockIcon size={18} />
            <span className="text-xs">Réservations</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 text-white hover:text-[#3EFEFE]"
            onClick={() => navigate('/renter/profile')}
          >
            <UserIcon size={18} />
            <span className="text-xs">Profil</span>
          </button>
        </div>
      </nav>
        {showAvisForm && selectedReservation && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <AvisForm
      id_reservation={selectedReservation.id_reservation}
      voiture={selectedReservation.voiture}
      conducteur={selectedReservation.conducteur}
      date_debut={selectedReservation.date_debut}
      date_fin={selectedReservation.date_fin}
      onSuccess={() => {
        setShowAvisForm(false);
        setSelectedReservation(null);
      }}
      onCancel={() => {
        setShowAvisForm(false);
        setSelectedReservation(null);
      }}
    />
  </div>
)}
      {showReviewsModal && selectedCarId && (
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
            {/* Affichage des avis du véhicule sélectionné */}
            <CarReviews ratings={cars[selectedCarId]?.ratings || []} ratingsLoading={false} />
          </div>
        </div>
      )}
    </div>;
};
export default RenterDashboard;