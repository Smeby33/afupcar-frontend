import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CarIcon, BellIcon, BarChart3Icon, PlusCircleIcon, UserIcon, LogOutIcon, SettingsIcon, TruckIcon } from 'lucide-react';
import Button from '../../components/ui/Button';
import RevenueChart from '../../components/owner/RevenueChart';
import VehicleCard from '../../components/owner/VehicleCard';
import LivraisonList from '../../components/owner/LivraisonList';
import { auth } from '../../pages/firebaseConfig';
import { getAuth, signOut } from 'firebase/auth';

import axios from 'axios';
import { toast } from 'sonner';

interface Vehicle {
  id: string;
  marque: string;
  modele: string;
  photofront: string;
  prix: number;
  statut: boolean;
}

const OwnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBtnClicked, setIsBtnClicked] = useState(false);
  const [showLivraisons, setShowLivraisons] = useState(false);
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const [revenusParJour, setRevenusParJour] = useState<{ day: string, amount: number }[]>(
    days.map(day => ({ day, amount: 0 }))
  );

  useEffect(() => {
    const fetchOwnerVehicles = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          toast.error('Vous devez être connecté');
          navigate('/owner/login');
          return;
        }
        console.log('🚀 currentUser:', currentUser);

        const response = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/cars/byOwner/${currentUser.uid}`);
        setVehicles(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des véhicules:", error);
        toast.error("Erreur lors du chargement des véhicules");
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchRevenusParJour = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        const response = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/reservations/revenue/daily/${currentUser.uid}`);
        console.log('🚀 Revenus par jour:', response.data);
        let data = response.data;

        // Si tu reçois un tableau d'objets { day, amount }
        if (Array.isArray(data) && data[0]?.day && data[0]?.amount !== undefined) {
          // Complète les jours manquants à 0
          const fullData = days.map(day => {
            const found = data.find((d: any) => d.day === day);
            return { day, amount: found ? found.amount : 0 };
          });
          setRevenusParJour(fullData);
        } else if (Array.isArray(data)) {
          // Si tu reçois juste un tableau de nombres
          setRevenusParJour(
            days.map((day, i) => ({
              day,
              amount: data[i] ?? 0
            }))
          );
        } else {
          setRevenusParJour(days.map(day => ({ day, amount: 0 })));
        }
      } catch (error) {
        setRevenusParJour(days.map(day => ({ day, amount: 0 })));
        console.error("Erreur lors de la récupération des revenus:", error);
        toast.error("Aucun revenu trouvé lors du chargement des revenus");
      }
    };

    fetchOwnerVehicles();
    fetchRevenusParJour();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/owner/login');
      toast.success('Déconnexion réussie');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar for desktop */}
      <div className="hidden md:fixed md:flex md:flex-col md:w-64 md:h-screen bg-black text-white p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-[#3EFEFE] flex items-center justify-center">
            <CarIcon className="text-black" size={24} />
          </div>
          <h1 className="text-xl font-bold">Lotu Auto</h1>
        </div>
        <nav className="space-y-4">
          <button className="w-full flex items-center gap-3 text-[#3EFEFE] p-3 rounded-lg bg-gray-900">
            <BarChart3Icon size={20} />
            <span>Tableau de bord</span>
          </button>
          <button className="w-full flex items-center gap-3 text-gray-400 hover:text-white p-3 rounded-lg hover:bg-gray-900"
            onClick={() => navigate('/owner/vehicle/OwnerVehicles')}
          >
            <CarIcon size={20} />
            <span>Mes véhicules</span>
          </button>
          <button className="w-full flex items-center gap-3 text-gray-400 hover:text-white p-3 rounded-lg hover:bg-gray-900"
            onClick={() => navigate('/owner/notifications')}
          >
              <BellIcon size={20} />
            <span>Notifications</span>
          </button>
          <button className="w-full flex items-center gap-3 text-gray-400 hover:text-white p-3 rounded-lg hover:bg-gray-900"
          onClick={() => navigate('/owner/profile')}
          >
            <UserIcon size={20} />
            <span>Profil</span>
          </button>
          <button className="w-full flex items-center gap-3 text-gray-400 hover:text-white p-3 rounded-lg hover:bg-gray-900">
            <SettingsIcon size={20} />
            <span>Paramètres</span>
          </button>
        </nav>
        <button
          className="mt-auto flex items-center gap-3 text-gray-400 hover:text-white p-3 rounded-lg hover:bg-gray-900"
          onClick={handleLogout}
        >
          <LogOutIcon size={20} />
          <span>Déconnexion</span>
        </button>
      </div>
      {/* Main content */}
      <div className="md:ml-64 mb-20 md:mb-0">
        {/* Mobile header */}
        <header className="md:hidden bg-gray-100 shadow sticky top-0 z-40 p-4">
          <div className="flex justify-between items-right">
            {/* <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#3EFEFE] flex items-center justify-center">
                <CarIcon className="text-black" size={24} />
              </div>
              <h1 className="text-xl font-bold">Tableau de bord</h1>
            </div> */}
            <button
                  className="p-2 rounded-full bg-gray-100 hover:bg-[#3EFEFE] hover:text-black transition"
                  title="Voir les livraisons à effectuer"
                  onClick={() => navigate('/owner/livraisons')}
                  style={{
                backgroundColor: isBtnClicked ? '#3EFEFE' : 'black',
                color: isBtnClicked ? 'black' : 'white',
                borderRadius: '40px',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
                width: '50px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'background 0.1s, color 0.1s',
              }}
                >
                    <TruckIcon size={16} />
            </button>
            <button onClick={() => {
                setIsBtnClicked(true);
                setTimeout(() => navigate('/owner/add-vehicle'), 120); // court délai pour l'effet visuel
              }} className="!py-2"
              style={{
                backgroundColor: isBtnClicked ? '#3EFEFE' : 'black',
                color: isBtnClicked ? 'black' : 'white',
                borderRadius: '40px',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
                width: '70px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'background 0.1s, color 0.1s',
              }}>
              <PlusCircleIcon size={16} />
              <CarIcon className="text-white" size={18} />

              <span className="hidden md:inline">Ajouter un véhicule</span>
            </button>
          </div>
        </header>
        {/* Desktop header */}
        <header className="w-full bg-white shadow mb-6 static top-0 left-0 z-30">
          <div className="hidden md:block p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button
                  className="p-2 rounded-full bg-gray-100 hover:bg-[#3EFEFE] hover:text-black transition"
                  title="Voir les livraisons à effectuer"
                  onClick={() => navigate('/owner/livraisons')}
                >
                 
                    <TruckIcon size={24} />
                </button>
                <h1 className="text-2xl font-bold">Tableau de bord</h1>
              </div>
              <Button variant="primary" onClick={() => navigate('/owner/add-vehicle')} className="!py-2">
                <PlusCircleIcon size={20} />
                Ajouter un véhicule
              </Button>
            </div>
          </div>
        </header>
        {/* Stats */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#3EFEFE] bg-opacity-20 flex items-center justify-center">
                  <CarIcon className="text-black" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Véhicules</p>
                  <p className="text-1xl font-bold">{vehicles.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#3EFEFE] bg-opacity-20 flex items-center justify-center">
                  <BarChart3Icon className="text-black" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Revenue (FCFA)</p>
                  <p className="text-1xl font-bold">450,000</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#3EFEFE] bg-opacity-20 flex items-center justify-center">
                  <BellIcon className="text-black" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Notifications</p>
                  <p className="text-1xl font-bold">2</p>
                </div>
              </div>
            </div>
          </div>
          {/* Main content grid */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Mes véhicules</h2>
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/owner/vehicle/OwnerVehicles')}
                    className="!py-1 h-30"
                  >
                    Voir tout
                  </Button>
                </div>
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <p>Chargement des véhicules...</p>
                  </div>
                ) : vehicles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                    <p>Aucun véhicule enregistré</p>
                    <Button 
                      variant="primary" 
                      onClick={() => navigate('/owner/add-vehicle')} 
                      className="mt-4"
                    >
                      Ajouter un véhicule
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vehicles.slice(0, 4).map((vehicle) => {
                      console.log('vehicle.status:', vehicle.statut); // <-- Ajout du log
                      return (
                        <VehicleCard
                          key={vehicle.id}
                          id={vehicle.id}
                          name={`${vehicle.marque} ${vehicle.modele}`}
                          price={vehicle.prix}
                          prixhorszone={vehicle.prixhorszone}
                          image={vehicle.photofront}
                          status={vehicle.statut ? "Disponible" : "Indisponible"}
                        />
                      );
                    })}
                  </div>
                )}
              </section>
              <section className="bg-white rounded-xl shadow-sm p-6 ">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Revenus</h2>
                </div>
                <RevenueChart data={revenusParJour} currency="FCFA" />
              </section>
            </div>
            
          </div>
        </div>
        {/* Affichage du composant LivraisonList si showLivraisons est true */}
        {showLivraisons && < LivraisonList />}
      </div>
      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-[#222]" style={{ borderRadius: '40px 40px 40px 40px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',margin: '0 2px 15px 2px',borderBlockColor: '#222' }}>
        <div className="flex justify-around p-3">
          <button className="flex flex-col items-center gap-1 text-[#3EFEFE]">
            <BarChart3Icon size={18} />
            <span className="text-xs font-semibold">Dashboard</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white hover:text-[#3EFEFE]"
            onClick={() => navigate('/owner/vehicle/OwnerVehicles')}>
            <CarIcon size={18} />
            <span className="text-xs">Véhicules</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 text-white hover:text-[#3EFEFE]"
            onClick={() => navigate('/owner/notifications')}>

            <BellIcon size={18} />
            <span className="text-xs">Notifications</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 text-white hover:text-[#3EFEFE]"
            onClick={() => navigate('/owner/profile')}
          >
            <UserIcon size={18} />
            <span className="text-xs">Profil</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default OwnerDashboard;