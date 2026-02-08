import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
// Ajout des icônes Lucide
import { UsersIcon, HomeIcon, CalendarCheck2Icon, CarIcon, LogInIcon, FileTextIcon, CreditCardIcon, InfoIcon, LayoutDashboardIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Ajout pour la navigation
import Loader from '../../components/ui/Loader';

interface AdminData {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  date_creation: string;
  last_login: string;
  lastvisite?: string;
}

interface StatsData {
  owners: number;
  renters: number;
  reservations: number;
  cars: number;
}

const AdminDashboard: React.FC = () => {
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = getAuth();
  const navigate = useNavigate(); // Hook pour navigation

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error('Admin non connecté');
        }

        // Récupération des données admin
        const adminResponse = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/admins/getOneAdmin/${user.uid}`);
        setAdminData(adminResponse.data);

        // Récupération des statistiques via /getCounts
        const statsResponse = await axios.get('https://qxmaqyf9jt.us-east-1.awsapprunner.com/admins/getCounts');
        setStats(statsResponse.data);

        // Mise à jour de la dernière visite
        await axios.put(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/admins/updateVisite/${user.uid}`);

      } catch (err) {
        console.error('Erreur:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [auth]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  // Ajoute ce composant juste avant le <header>
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

  return (
    <div className="min-h-screen bg-black p-6 pb-16">
      <MobileNav />
      {/* Header */}
      <header className="mb-8">
        <div className="flex w-full justify-between items-center">
          <div className='w-full'>
            <div className='flex w-full items-center gap-4 mb-4 justify-between'>
                <h1 className="text-3xl font-bold text-[#3EFEFE]">Dashboard Admin</h1>
                <button
                onClick={() => navigate('/admin/legales')}
                className="flex items-center gap-2 rounded  text-black font-semibold shadow hover:bg-[#eaff8b] transition"
              >
                <UsersIcon className="w-5 h-5 text-[#3EFEFE] " /> 
              </button>
            </div>
            <p className="text-white">
              Bienvenue, <span className="font-bold text-[#3EFEFE]">{adminData?.prenom} {adminData?.nom}</span>
            </p>
            <div className="flex items-center mt-2 text-sm text-gray-300">
              <span>
                Dernière connexion:{" "}
                {adminData?.lastvisite
                  ? new Date(adminData.lastvisite).toLocaleString()
                  : "Jamais"}
              </span>
            </div>
          </div>
          
        </div>
      </header>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Propriétaires" 
          value={stats?.owners || 0} 
          icon={<HomeIcon className="w-8 h-8 text-[#3EFEFE]" />} 
          color="bg-gray-900 text-white"
          onClick={() => navigate('/admin/owners')}
          clickable
        />
        <StatCard 
          title="Locataires" 
          value={stats?.renters || 0} 
          icon={<UsersIcon className="w-8 h-8 text-[#3EFEFE]" />} 
          color="bg-gray-900 text-white"
          onClick={() => navigate('/admin/renters')}
          clickable
        />
        <StatCard 
          title="Réservations" 
          value={stats?.reservations || 0} 
          icon={<CalendarCheck2Icon className="w-8 h-8 text-[#3EFEFE]" />}
          onClick={() => navigate('/admin/reservations')} 
          color="bg-gray-900 text-white"
          clickable
        />
        <StatCard 
          title="Véhicules" 
          value={stats?.cars || 0} 
          icon={<CarIcon className="w-8 h-8 text-[#3EFEFE]" />} 
          color="bg-gray-900 text-white"
          onClick={() => navigate('/admin/cars')}
          clickable
        />
      </div>

      {/* Sections du dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dernières réservations */}
        <SectionCard title="Dernières Réservations">
          <ReservationsList />
        </SectionCard>

        {/* Activité récente */}
        <SectionCard title="Activité Récente">
          <ActivityLog />
        </SectionCard>

        {/* Actions rapides */}
        <SectionCard title="Actions Rapides">
          <QuickActions />
        </SectionCard>
      </div>
    </div>
  );
};

// Composants enfants
const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string; onClick?: () => void; clickable?: boolean }> = ({ 
  title, 
  value, 
  icon, 
  color,
  onClick,
  clickable = false
}) => (
  <div
    className={`p-6 rounded-lg shadow-sm ${color} border border-gray-800 ${clickable ? 'cursor-pointer hover:shadow-lg transition' : ''}`}
    onClick={clickable ? onClick : undefined}
    tabIndex={clickable ? 0 : -1}
    role={clickable ? 'button' : undefined}
  >
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-2xl font-bold text-[#3EFEFE]">{value}</p>
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  </div>
);

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-800 text-white">
    <h2 className="text-lg font-semibold mb-4 text-[#3EFEFE]">{title}</h2>
    {children}
  </div>
);

const ReservationsList: React.FC = () => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [carNames, setCarNames] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    axios.get('https://qxmaqyf9jt.us-east-1.awsapprunner.com/reservations/reservations/last10')
      .then(async response => {
        setReservations(response.data);

        // Pour chaque réservation, récupérer le nom de la voiture
        const carIds = [...new Set(response.data.map((res: any) => res.voiture))];
        const carNamesObj: { [key: string]: string } = {};

        await Promise.all(carIds.map(async (carId) => {
          try {
            const carRes = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/car/${carId}`);
            const car = carRes.data;
            carNamesObj[carId] = `${car.marque} ${car.modele}`;
          } catch {
            carNamesObj[carId] = "Véhicule inconnu";
          }
        }));

        setCarNames(carNamesObj);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-4">
      {reservations.length > 0 ? (
        reservations.map(res => (
          <div key={res.id} className="border-b border-gray-800 pb-3 last:border-b-0">
            <p className="font-medium text-[#3EFEFE]">
              {carNames[res.voiture] || "Chargement..."}
            </p>
            <p className="text-sm text-gray-300">
              {new Date(res.date_debut).toLocaleDateString()} - {new Date(res.date_fin).toLocaleDateString()}
            </p>
            <p className="text-sm font-bold text-[#3EFEFE]">{res.totale} FCFA</p>
          </div>
        ))
      ) : (
        <p className="text-gray-400 text-center py-4">Aucune réservation récente</p>
      )}
    </div>
  );
};

const ActivityLog: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  
  useEffect(() => {
    axios.get('https://qxmaqyf9jt.us-east-1.awsapprunner.com/activities/latest')
      .then(response => setActivities(response.data))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-3">
      {activities.length > 0 ? (
        activities.map(activity => (
          <div key={activity.id} className="flex items-start">
            <div className={`p-2 rounded-full mr-3 ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            <div>
              <p className="text-sm font-bold text-[#3EFEFE]">{activity.description}</p>
              <p className="text-xs text-gray-400">
                {new Date(activity.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-400 text-center py-4">Aucune activité récente</p>
      )}
    </div>
  );
};

const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-3">
      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm font-bold transition">
        Ajouter un véhicule
      </button>
      <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm font-bold transition">
        Valider une réservation
      </button>
      <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded text-sm font-bold transition">
        Envoyer une notification
      </button>
      <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded text-sm font-bold transition">
        Gérer les utilisateurs
      </button>
      <button
        onClick={() => navigate('/admin/modelecar')}
        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded text-sm font-bold transition"
      >
        Modèles véhicules
      </button>
    </div>
  );
};

// Helpers
const getActivityIcon = (type: string) => {
  switch (type) {
    case 'login': return <LogInIcon className="w-6 h-6 text-blue-800" />;
    case 'reservation': return <FileTextIcon className="w-6 h-6 text-green-800" />;
    case 'payment': return <CreditCardIcon className="w-6 h-6 text-purple-800" />;
    default: return <InfoIcon className="w-6 h-6 text-gray-800" />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'login': return 'bg-blue-100 text-blue-800';
    case 'reservation': return 'bg-green-100 text-green-800';
    case 'payment': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default AdminDashboard;