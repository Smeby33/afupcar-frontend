
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, ClockIcon, CarIcon, MoreVerticalIcon,BellIcon, Trash2Icon,LayoutDashboardIcon,UserIcon } from 'lucide-react';
import logoBlanc from '../../../logo-noir.png';
import axios from 'axios';
import { toast } from 'sonner';
import { getAuth } from "firebase/auth";

interface Car {
  id: string;
  marque: string;
  modele: string;
  photofront: string;
  prixhorszone?: number | null;
}

interface Reservation {
  id: string;
  voiture: string | Car;
  date_debut: string;
  date_fin: string;
  statut: number;
  totale: number;
  heuredeprise: string;
  created_at: string;
}

const ReservationsList: React.FC = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<string | null>(null);
  const [cars, setCars] = useState<{ [id: string]: Car | null }>({});
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    const fetchUnreadNotifications = async () => {
      try {
        const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/notifications/getNotifications/${user.uid}?unread=true`);
        setUnreadNotifCount(res.data.length);
      } catch (err) {
        setUnreadNotifCount(0);
      }
    };
    fetchUnreadNotifications();
  }, [user]);

  useEffect(() => {
    const fetchReservations = async () => {
      if (!user) {
        toast.error('Vous devez être connecté');
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/reservations/conducteur/${user.uid}`);
        setReservations(response.data);
      } catch (error) {
        toast.error('Erreur lors du chargement des réservations');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [user, navigate]);

  useEffect(() => {
    const fetchCars = async () => {
      const uniqueCarIds = Array.from(
        new Set(
          reservations
            .map(r => typeof r.voiture === 'string' ? r.voiture : r.voiture.id)
            .filter((id): id is string => !!id)
        )
      );
      const carsData: { [id: string]: Car | null } = {};
      await Promise.all(uniqueCarIds.map(async (carId) => {
        try {
          const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/car/${carId}`);
          carsData[carId] = res.data;
        } catch (e) {
          carsData[carId] = null;
        }
      }));
      setCars(carsData);
    };
    if (reservations.length > 0) fetchCars();
  }, [reservations]);

  const handleDeleteClick = (reservation: Reservation) => {
    const status = getReservationStatus(reservation.statut, reservation.date_debut, reservation.date_fin);
    if (
      status === 'confirmed' ||
      status === 'pending' ||
      status === 'consommation'
    ) {
      setReservationToDelete(reservation.id);
      setModalOpen(true);
    } else {
      cancelReservation(reservation.id);
    }
  };

  const confirmDelete = async () => {
    if (reservationToDelete) {
      await cancelReservation(reservationToDelete);
      setModalOpen(false);
      setReservationToDelete(null);
    }
  };

  const cancelDelete = () => {
    setModalOpen(false);
    setReservationToDelete(null);
  };

  const cancelReservation = async (reservationId: string) => {
    try {
      console.log(`[LOG] Tentative d'annulation de la réservation ${reservationId}`);
      const url = `https://qxmaqyf9jt.us-east-1.awsapprunner.com/reservations/supprimer/${reservationId}`;
      console.log('[LOG] URL appelée :', url);
      const response = await axios.delete(url);
      console.log('[LOG] Réponse du backend :', response.status, response.data);
      setReservations(reservations.map(res => 
        res.id === reservationId ? { ...res, statut: 0 } : res
      ));
      toast.success('Réservation annulée');
      console.log(`[LOG] Réservation ${reservationId} annulée avec succès`);

      // Notification pour le propriétaire
      try {
        // On récupère la réservation annulée pour les infos
        const resAnnulee = reservations.find(res => res.id === reservationId);
        let voitureId = undefined;
        if (resAnnulee) {
          if (typeof resAnnulee.voiture === 'string') {
            voitureId = resAnnulee.voiture;
          } else if (resAnnulee.voiture && typeof resAnnulee.voiture === 'object' && 'id' in resAnnulee.voiture) {
            voitureId = resAnnulee.voiture.id;
          }
        }
        if (resAnnulee && voitureId) {
          // Récupère le propriétaire du véhicule
          const carRes = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/car/${voitureId}`);
          const proprioId = carRes.data.proprio;
          console.log('[DEBUG] Envoi notification d\'annulation au propriétaire:', {
            userId: proprioId,
            reservationId,
            voiture: voitureId,
            conducteur: user?.uid || null,
            date_debut: resAnnulee.date_debut,
            date_fin: resAnnulee.date_fin
          });
          const notifProprio = await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/notifications/addNotification', {
            userId: proprioId,
            type: 'reservation',
            title: 'Réservation annulée',
            message: `Une réservation sur votre véhicule (${carRes.data.marque} ${carRes.data.modele}) a été annulée par le locataire.`,
            link: `/owner/reservations/${reservationId}`,
            meta: {
              reservationId,
              voiture: voitureId,
              conducteur: user?.uid || null,
              date_debut: resAnnulee.date_debut,
              date_fin: resAnnulee.date_fin
            }
          });
          console.log('[LOG] Réponse de la route notification annulation:', notifProprio.status, notifProprio.data);
        } else {
          console.warn('[WARN] Impossible d\'envoyer la notification d\'annulation : infos véhicule manquantes', {
            resAnnulee,
            voiture: resAnnulee?.voiture,
            voitureId
          });
        }
      } catch (notifErr) {
        console.error('[Notification] Erreur lors de la création de la notification d\'annulation:', notifErr);
      }
    } catch (error) {
      toast.error('Erreur lors de l\'annulation');
      if (axios.isAxiosError(error)) {
        console.error('[ERROR] Axios:', error.response?.status, error.response?.data, error.message);
      } else {
        console.error('[ERROR] Autre:', error);
      }
    }
  };

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

  // Trie les réservations les plus récentes en premier
  const sortedReservations = [...reservations].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const filteredReservations = sortedReservations.filter(res => {
    const status = getReservationStatus(res.statut, res.date_debut, res.date_fin);
    if (filter === 'all') return true;
    return status === filter;
  });

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'consommation':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  reservations.forEach(r => {
    if (!r.voiture || !r.voiture.id) {
      console.warn('Réservation sans voiture.id détectée :', r);
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 w-full">
      {/* Modal de confirmation */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4">Confirmation</h2>
            <p>Voulez-vous vraiment annuler cette réservation&nbsp;?</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded bg-red-600 text-white"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
<header className=" w-full mx-auto mb-2 flex items-center justify-end gap-4 sticky top-0 z-20 bg-gray-50 py-2" style={{ display: 'flex', justifyContent: 'space-between',marginTop: 0 }}>

  <button className="flex flex-col items-center gap-1 text-black hover:text-[#3EFEFE] relative"
    onClick={() => navigate('/renter/notifications')}>
    <span className="relative">
      <BellIcon size={20} />
      {unreadNotifCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 shadow">{unreadNotifCount}</span>
      )}
    </span>
  </button>
          {/* <button
            onClick={() => navigate(-1)}
            className=" rounded-full hover:bg-gray-200"
            title="Retour"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left">
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Mes Réservations</h1>
            <p className="text-gray-600" style={{fontSize:12}}>Gérez toutes vos locations de véhicules</p>
          </div>
          <a
                      href="/renter/dashboard"
                      style={{ minWidth: 60, display: 'flex', justifyContent: 'center' }}
                    >
                      <img
                        src={logoBlanc}
                        alt="Logo"
                        className="w-12 h-12 object-contain"
                        style={{ minWidth: 48, minHeight: 48 }}
                      />
          </a> */}
        </header>
      <div className="max-w-6xl mb-20 mx-auto">
        {/* Filtres */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`p-2 text-sm rounded-full ${filter === 'all' ? 'bg-black text-[#3EFEFE]' : 'bg-white border'}`}
          >
            Toutes
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 text-sm rounded-full ${filter === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-white border'}`}
          >
            En attente
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-4 py-2 text-sm rounded-full ${filter === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-white border'}`}
          >
            Confirmées
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 text-sm rounded-full ${filter === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-white border'}`}
          >
            Annulées
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 text-sm rounded-full ${filter === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-white border'}`}
          >
            Terminées
          </button>
        </div>

        {/* Liste des réservations */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Chargement en cours...</p>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">Aucune réservation trouvée</p>
            <button 
              onClick={() => navigate('/search')}
              className="mt-4 px-6 py-2 bg-[#3EFEFE] rounded-lg font-medium"
            >
              Trouver un véhicule
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map((reservation) => (
              <div key={reservation.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Véhicule */}
                    <div 
                      className="flex items-center gap-4 cursor-pointer"
                      onClick={() => navigate(`/renter/booking/${reservation.voiture}`)}
                    >
                      <div className="w-20 h-20 rounded-md overflow-hidden bg-gray-200">
                        {(() => {
                          let carId = typeof reservation.voiture === 'string' ? reservation.voiture : reservation.voiture.id;
                          const carObj = cars[carId];
                          return carObj && carObj.photofront ? (
                            <img 
                              src={carObj.photofront} 
                              alt={`${carObj.marque || ''} ${carObj.modele || ''}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <CarIcon size={24} />
                            </div>
                          );
                        })()}
                      </div>
                      <div>
                        <h3 className="font-bold">
                          {(() => {
                            let carId = typeof reservation.voiture === 'string' ? reservation.voiture : reservation.voiture.id;
                            const carObj = cars[carId];
                            return carObj ? `${carObj.marque} ${carObj.modele}` : '';
                          })()}
                        </h3>
                        <p className="text-gray-600 text-sm">ID: {reservation.id}</p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon size={16} className="text-gray-500" />
                        <span>{formatDate(reservation.date_debut)}</span>
                      </div>
                      <span>→</span>
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon size={16} className="text-gray-500" />
                        <span>{formatDate(reservation.date_fin)}</span>
                      </div>
                    </div>

                    {/* Statut et actions */}
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(getReservationStatus(reservation.statut as number, reservation.date_debut, reservation.date_fin))}`}>
                        {getReservationStatus(reservation.statut as number, reservation.date_debut, reservation.date_fin) === 'pending' && 'En attente'}
                        {getReservationStatus(reservation.statut as number, reservation.date_debut, reservation.date_fin) === 'confirmed' && 'Confirmée'}
                        {getReservationStatus(reservation.statut as number, reservation.date_debut, reservation.date_fin) === 'cancelled' && 'Annulée'}
                        {getReservationStatus(reservation.statut as number, reservation.date_debut, reservation.date_fin) === 'completed' && 'Terminée'}
                        {getReservationStatus(reservation.statut as number, reservation.date_debut, reservation.date_fin) === 'consommation' && 'En cours de consommation'}
                      </span>
                      {/* Icône de suppression */}
                      <button
                        onClick={() => handleDeleteClick(reservation)}
                        className="p-2 rounded-full hover:bg-red-100"
                        title="Annuler la réservation"
                      >
                        <Trash2Icon size={18} className="text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Détails supplémentaires */}
                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ClockIcon size={16} />
                      <span>Prise de véhicule à {reservation.heuredeprise}</span>
                    </div>
                    <div className="text-lg font-bold">
                      {reservation.totale.toLocaleString()} FCFA
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-[#222]" style={{ borderRadius: '40px 40px 40px 40px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',margin: '0 2px 15px 2px',borderBlockColor: '#222' }}>
        <div className="flex justify-around p-3">
          <button  onClick={() => navigate('/renter/dashboard')} className="flex flex-col items-center gap-1 text-white hover:text-[#3EFEFE]">
            <LayoutDashboardIcon size={18} />
            <span className="text-xs font-semibold">Dashboard</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white hover:text-[#3EFEFE]"
            onClick={() => navigate('/renter/search')}>
            <CarIcon size={18} />
            <span className="text-xs">Recherche</span>
          </button>
          <button onClick={() => navigate('/renter/reservations')} className="flex flex-col items-center gap-1 text-[#3EFEFE]">
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
    </div>
  );
};

export default ReservationsList;