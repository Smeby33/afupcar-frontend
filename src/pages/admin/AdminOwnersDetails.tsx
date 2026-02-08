import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import AdminOwnerCard from '../../components/admin/AdminOwnerCard';
import AdminCarCard from '../../components/admin/AdminCarCard';
import AdminReservationCard from '../../components/admin/AdminReservationCard';
import AdminRenterCard from '../../components/admin/AdminRenterCard';
import { FaArrowLeft, FaInfoCircle, FaCar, FaCalendarAlt, FaUsers } from "react-icons/fa";
import { LayoutDashboardIcon, HomeIcon, UsersIcon, CalendarCheck2Icon, CarIcon } from 'lucide-react';
import Loader from '../../components/ui/Loader';

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

interface Reservation {
  id: string;
  conducteur: string;
  voiture: string;
  proprietaire: string;
  date_debut: string;
  date_fin: string;
  avance: number;
  caution: number;
  livraison: number;
  heuredeprise: string;
  heurederetour: number;
  totale: number;
  statut: number;
  latitude: string;
  longitude: string;
  created_at: string;
}

interface Renter {
  id: string;
  fullname: string;
  email: string;
  phone: string;
  cni: string;
  permis: string;
  photo: string;
  created_at: string;
}

const AdminOwnersDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'info' | 'voitures' | 'reservations' | 'clients'>('info');
  const [owner, setOwner] = useState<Owner | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [renters, setRenters] = useState<Renter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error('Administrateur non connecté');

        // Récupérer les infos de base du propriétaire
        const ownerResponse = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/owners/getOwner/${id}`);
        setOwner(ownerResponse.data);

        // Récupérer les voitures
        const carsResponse = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/cars/byOwner/${id}`);
        setCars(carsResponse.data);

        // Récupérer les réservations
        const reservationsResponse = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/reservations/reservations/proprietaire/${id}`);
        setReservations(reservationsResponse.data);

        // Récupérer les renters avec la nouvelle route
        const rentersResponse = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/renters/renters/byOwner/${id}`);
        setRenters(rentersResponse.data);

      } catch (err) {
        console.error('Erreur:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerData();
  }, [id]);

  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Informations de l'entreprise</h2>
            {owner ? (
              <AdminOwnerCard owner={owner} onOwnerUpdated={async () => {
                try {
                  const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/owners/getOwner/${id}`);
                  setOwner(res.data);
                  // Notification au propriétaire lors de la modification de ses infos
                  await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/notifications/addNotification', {
                    userId: id,
                    type: 'profil_modifie',
                    title: 'Profil modifié par l\'admin',
                    message: 'Votre profil a été modifié par l\'administrateur.',
                    link: `/owner/profile`,
                    meta: { ownerId: id }
                  });
                  console.log('[LOG] Notification propriétaire modification profil envoyée');
                } catch (notifErr) {
                  console.error('[Notification] Erreur notification modification profil propriétaire:', notifErr);
                }
              }} />
            ) : (
              <p>Chargement...</p>
            )}
          </div>
        );
      case 'voitures':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Voitures ({cars.length})</h2>
            {cars.length > 0 ? (
              <div>
                {cars.map(car => (
                  <AdminCarCard key={car.id} car={car} />
                ))}
              </div>
            ) : (
              <p>Aucune voiture enregistrée</p>
            )}
          </div>
        );
      case 'reservations':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Réservations ({reservations.length})</h2>
            {reservations.length > 0 ? (
              <div className="space-y-4">
                {reservations.map(res => (
                  <AdminReservationCard key={res.id} reservation={res} />
                ))}
              </div>
            ) : (
              <p>Aucune réservation trouvée</p>
            )}
          </div>
        );
      case 'clients':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Clients ({renters.length})</h2>
            {renters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {renters.map(renter => (
                  <AdminRenterCard
                    key={renter.id}
                    renter={renter}
                    onRenterUpdated={() => {
                      // Re-fetch renters après modif/suppression
                      axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/renters/renters/byOwner/${id}`).then(res => setRenters(res.data));
                    }}
                  />
                ))}
              </div>
            ) : (
              <p>Aucun client trouvé</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // Barre de navigation mobile
  const MobileNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-800 flex justify-between items-center px-2 py-1 md:hidden">
      <button
        onClick={() => navigate('/admin/dashboard')}
        className="flex flex-col items-center flex-1 py-2"
      >
        <LayoutDashboardIcon className="w-6 h-6 text-[#3EFEFE]" />
        <span className="text-xs text-white font-bold">Dashboard</span>
      </button>
      <button
        onClick={() => navigate('/admin/owners')}
        className="flex flex-col items-center flex-1 py-2"
      >
        <HomeIcon className="w-6 h-6 text-[#3EFEFE]" />
        <span className="text-xs text-white font-bold">Owners</span>
      </button>
      <button
        onClick={() => navigate('/admin/renters')}
        className="flex flex-col items-center flex-1 py-2"
      >
        <UsersIcon className="w-6 h-6 text-[#3EFEFE]" />
        <span className="text-xs text-white font-bold">Renters</span>
      </button>
      <button
        onClick={() => navigate('/admin/reservations')}
        className="flex flex-col items-center flex-1 py-2"
      >
        <CalendarCheck2Icon className="w-6 h-6 text-[#3EFEFE]" />
        <span className="text-xs text-white font-bold">Réservations</span>
      </button>
      <button
        onClick={() => navigate('/admin/cars')}
        className="flex flex-col items-center flex-1 py-2"
      >
        <CarIcon className="w-6 h-6 text-[#3EFEFE]" />
        <span className="text-xs text-white font-bold">Cars</span>
      </button>
    </nav>
  );

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-black pb-16">
      <MobileNav />
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-gray-900 shadow-md">
        <div className="p-4 border-b border-gray-800 flex flex-col md:block items-center">
          {/* Mobile: flèche à gauche, nom à droite */}
          <div className="flex w-full items-center justify-between md:block">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-[#3EFEFE] text-black font-bold hover:bg-[#b6e62f] transition flex items-center justify-center w-10 h-10"
              aria-label="Retour"
            >
              <FaArrowLeft />
            </button>
            <h2 className="text-xl font-bold text-[#3EFEFE] text-right flex-1 md:text-left">
              {owner ? `${owner.fullname}` : 'Propriétaire'}
            </h2>
            {/* Espace réservé pour équilibrer le flex (rien à droite) */}
            <div className="w-10 h-10 hidden md:block" />
          </div>
          <p className="text-sm text-gray-300 text-center md:text-left mt-2">Gestion du propriétaire</p>
        </div>
        <nav className="p-4">
          <ul className="flex md:block gap-2 md:gap-0 justify-between">
            <li className="flex-1">
              <button
                onClick={() => setActiveTab('info')}
                className={`w-full flex items-center gap-2 text-left px-4 py-2 rounded font-bold ${
                  activeTab === 'info'
                    ? 'bg-[#3EFEFE] text-black'
                    : 'text-white hover:bg-gray-800'
                }`}
              >
                <FaInfoCircle className="md:hidden" />
                <span className="hidden md:inline">Informations Entreprise</span>
              </button>
            </li>
            <li className="flex-1">
              <button
                onClick={() => setActiveTab('voitures')}
                className={`w-full flex items-center gap-2 text-left px-4 py-2 rounded font-bold ${
                  activeTab === 'voitures'
                    ? 'bg-[#3EFEFE] text-black'
                    : 'text-white hover:bg-gray-800'
                }`}
              >
                <FaCar className="md:hidden" />
                <span className="hidden md:inline">Voitures</span>
              </button>
            </li>
            <li className="flex-1">
              <button
                onClick={() => setActiveTab('reservations')}
                className={`w-full flex items-center gap-2 text-left px-4 py-2 rounded font-bold ${
                  activeTab === 'reservations'
                    ? 'bg-[#3EFEFE] text-black'
                    : 'text-white hover:bg-gray-800'
                }`}
              >
                <FaCalendarAlt className="md:hidden" />
                <span className="hidden md:inline">Réservations</span>
              </button>
            </li>
            <li className="flex-1">
              <button
                onClick={() => setActiveTab('clients')}
                className={`w-full flex items-center gap-2 text-left px-4 py-2 rounded font-bold ${
                  activeTab === 'clients'
                    ? 'bg-[#3EFEFE] text-black'
                    : 'text-white hover:bg-gray-800'
                }`}
              >
                <FaUsers className="md:hidden" />
                <span className="hidden md:inline">Clients</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-2 md:p-8 bg-white text-black">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminOwnersDetails;