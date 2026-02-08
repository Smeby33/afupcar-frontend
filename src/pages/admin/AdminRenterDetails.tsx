import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import AdminRenterCard from '../../components/admin/AdminRenterCard';
import AdminReservationCard from '../../components/admin/AdminReservationCard';
import { FaArrowLeft, FaInfoCircle, FaCalendarAlt } from "react-icons/fa";
import { LayoutDashboardIcon, HomeIcon, UsersIcon, CalendarCheck2Icon, CarIcon } from 'lucide-react';
import Loader from '../../components/ui/Loader';

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

const AdminRenterDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'info' | 'reservations'>('info');
  const [renter, setRenter] = useState<Renter | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRenterData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error('Administrateur non connecté');

        // Récupérer les infos du locataire
        const renterResponse = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/renters/getRenter/${id}`);
        setRenter(renterResponse.data);

        // Récupérer les réservations du locataire
        const reservationsResponse = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/reservations/conducteur/${id}`);
        setReservations(reservationsResponse.data);

      } catch (err) {
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchRenterData();
  }, [id]);

  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Informations du locataire</h2>
            {renter ? (
              <AdminRenterCard renter={renter} onRenterUpdated={async () => {
                try {
                  const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/renters/getRenter/${id}`);
                  setRenter(res.data);
                  // Notification au conducteur lors de la modification de ses infos
                  await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/notifications/addNotification', {
                    userId: id,
                    type: 'profil_modifie',
                    title: 'Profil modifié par l\'admin',
                    message: 'Votre profil a été modifié par l\'administrateur.',
                    link: `/renter/profile`,
                    meta: { renterId: id }
                  });
                  console.log('[LOG] Notification conducteur modification profil envoyée');
                } catch (notifErr) {
                  console.error('[Notification] Erreur notification modification profil conducteur:', notifErr);
                }
              }} />
            ) : (
              <p>Chargement...</p>
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
              {renter ? `${renter.fullname}` : 'Locataire'}
            </h2>
            <div className="w-10 h-10 hidden md:block" />
          </div>
          <p className="text-sm text-gray-300 text-center md:text-left mt-2">Gestion du locataire</p>
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
                <span className="hidden md:inline">Informations</span>
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

export default AdminRenterDetails;