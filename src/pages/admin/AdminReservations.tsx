import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import AdminReservationCard from '../../components/admin/AdminReservationCard';
import Loader from '../../components/ui/Loader';
import { ArrowLeftIcon, LayoutDashboardIcon, HomeIcon, UsersIcon, CalendarCheck2Icon, CarIcon } from 'lucide-react';

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

const AdminReservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error('Administrateur non connecté');
        // Utilise la nouvelle route ici
        const response = await axios.get('https://qxmaqyf9jt.us-east-1.awsapprunner.com/reservations/recuperer/allReservation');
        setReservations(response.data);
      } catch (err) {
        setError('Erreur lors du chargement des réservations');
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

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

  // Calcul des revenus
  const revenue = reservations
    .filter(r => getReservationStatus(r.statut, r.date_debut, r.date_fin) === 'completed')
    .reduce((sum, r) => sum + (Number(r.totale) || 0), 0);

  const revenueManque = reservations
    .filter(r => getReservationStatus(r.statut, r.date_debut, r.date_fin) === 'cancelled')
    .reduce((sum, r) => sum + (Number(r.totale) || 0), 0);

  const revenueAvenir = reservations
    .filter(r => getReservationStatus(r.statut, r.date_debut, r.date_fin) === 'pending')
    .reduce((sum, r) => sum + (Number(r.totale) || 0), 0);

  const revenueNet = Math.round(revenue * 0.15);

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
          <div className="flex w-full items-center justify-between md:block">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-[#3EFEFE] text-black font-bold hover:bg-[#b6e62f] transition flex items-center justify-center w-10 h-10"
              aria-label="Retour"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-[#3EFEFE] text-right flex-1 md:text-left">
              Réservations
            </h2>
            <div className="w-10 h-10 hidden md:block" />
          </div>
          <p className="text-sm text-gray-300 text-center md:text-left mt-2">Gestion des réservations</p>
        </div>
        <nav className="p-4">
          {/* Statuts des réservations */}
          <ul className="flex flex-row md:flex-col gap-2 mt-4 md:mb-8">
            {['pending', 'confirmed', 'consommation', 'completed', 'cancelled'].map((status) => {
              const count = reservations.filter(r =>
                getReservationStatus(r.statut, r.date_debut, r.date_fin) === status
              ).length;
              let label = '';
              let icon = null;
              switch (status) {
                case 'pending':
                  label = 'En attente';
                  icon = <CalendarCheck2Icon className="w-6 h-6 md:mr-2" />;
                  break;
                case 'confirmed':
                  label = 'Confirmées';
                  icon = <CalendarCheck2Icon className="w-6 h-6 md:mr-2" />;
                  break;
                case 'consommation':
                  label = 'En cours';
                  icon = <CarIcon className="w-6 h-6 md:mr-2" />;
                  break;
                case 'completed':
                  label = 'Terminées';
                  icon = <LayoutDashboardIcon className="w-6 h-6 md:mr-2" />;
                  break;
                case 'cancelled':
                  label = 'Annulées';
                  icon = <UsersIcon className="w-6 h-6 md:mr-2" />;
                  break;
              }
              const isActive = selectedStatus === status;
              return (
                <li key={status} className="flex-1">
                  <button
                    type="button"
                    onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
                    className={`w-full ${isActive ? 'ring-2 ring-[#3EFEFE]' : ''}`}
                  >
                    <div className={`flex flex-col md:flex-row items-center justify-center md:justify-between px-1 py-2 rounded font-bold ${getStatusStyle(status)}`}>
                      <span className="flex flex-col items-center md:flex-row md:gap-2">
                        {icon}
                        <span className="text-[10px]  mt-0 md:mt-0">{label}</span>
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
          
        </nav>
      </div>
      {/* Main Content */}
      <div className="flex-1 p-2 md:p-8 bg-white text-black">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Liste des Réservations</h1>
          <span className="mt-1 md:mt-0 md:ml-2">
            {
              reservations.filter((reservation) =>
                selectedStatus
                  ? getReservationStatus(reservation.statut, reservation.date_debut, reservation.date_fin) === selectedStatus
                  : true
              ).length
            }
          </span>
        </div>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {(reservations.length > 0 ? (
              reservations
                .filter((reservation) =>
                  selectedStatus
                    ? getReservationStatus(reservation.statut, reservation.date_debut, reservation.date_fin) === selectedStatus
                    : true
                )
                .map((reservation) => (
                  <AdminReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    onReservationUpdated={() => {
                      axios.get('https://qxmaqyf9jt.us-east-1.awsapprunner.com/reservations/recuperer/allReservation').then(res => setReservations(res.data));
                    }}
                    onDelete={async () => {
                      if (window.confirm("Voulez-vous vraiment supprimer cette réservation ?")) {
                        try {
                          await axios.delete(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/reservations/supprimer/${reservation.id}`);
                          setReservations(reservations => reservations.filter(r => r.id !== reservation.id));
                        } catch (err) {
                          alert("Erreur lors de la suppression.");
                        }
                      }
                    }}
                  />
                ))
            ) : (
              <div className="p-6 text-center text-gray-500">Aucune réservation trouvée</div>
            ))}
          </div>
        </div>
        {/* Revenus - version mobile en flex row */}
          <div className="flex flex-wrap md:flex-col gap-2 mt-4">
            <div className="bg-blue-100 text-blue-800 rounded px-4 py-2 font-bold flex-1 flex items-center justify-between min-w-[48%]">
              <span>Transactions</span>
              <span>{revenue.toLocaleString()} FCFA</span>
            </div>
            <div className="bg-red-100 text-red-800 rounded px-4 py-2 font-bold flex-1 flex items-center justify-between min-w-[48%]">
              <span>Revenu manqué</span>
              <span>{revenueManque.toLocaleString()} FCFA</span>
            </div>
            <div className="bg-yellow-100 text-yellow-800 rounded px-4 py-2 font-bold flex-1 flex items-center justify-between min-w-[48%]">
              <span>Revenu à venir</span>
              <span>{revenueAvenir.toLocaleString()} FCFA</span>
            </div>
            <div className="bg-green-100 text-green-800 rounded px-4 py-2 font-bold flex-1 flex items-center justify-between min-w-[48%]">
              <span>Revenu net (15%)</span>
              <span>{revenueNet.toLocaleString()} FCFA</span>
            </div>
          </div>
      </div>
    </div>
  );
};

export default AdminReservations;