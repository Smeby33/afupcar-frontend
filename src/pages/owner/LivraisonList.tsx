import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { getAuth } from 'firebase/auth';
import LivraisonCard from '../../components/owner/LivraisonCard';
import { CarIcon, BellIcon, BarChart3Icon, PlusCircleIcon, UserIcon, LogOutIcon, SettingsIcon, TruckIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';



interface Livraison {
  id: string;
  voiture: string;
  client: string;
  date_livraison: string;
  date_depot: string;
  lieu: string;
  statut: string;
}

const LivraisonListPage: React.FC = () => {
  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBtnClicked, setIsBtnClicked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLivraisons = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          toast.error('Utilisateur non connecté');
          setLoading(false);
          return;
        }
        const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/reservations/livraisons/byOwnerLivree/${user.uid}`);
        setLivraisons(res.data);
        console.log('les livraisons sont',res.data);
      } catch (e) {
        toast.error('Erreur lors du chargement des livraisons à faire');
      } finally {
        setLoading(false);
      }
    };
    fetchLivraisons();
  }, []);

  if (loading) return     <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
;
  if (livraisons.length === 0) return <div>Aucune livraison à effectuer.</div>;

  return (
    <div className="bg-white rounded-lg shadow">
         <header className="bg-gray-100 shadow text-white p-4 sticky top-0 z-30">
                <div className="max-w-6xl mx-auto">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      {/* Bouton retour */}
                      {/* <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-800 transition"
                        title="Retour"
                      >
                        <ArrowLeftIcon size={20} />
                        <span className="hidden md:inline">Retour</span>
                      </button> */}
                      {/* <h1 className="text-2xl text-black font-bold">Mes véhicules</h1> */}
                    </div>
                    <button
                      onClick={() => {
                        setIsBtnClicked(true);
                        setTimeout(() => navigate('/owner/add-vehicle'), 120); // court délai pour l'effet visuel
                      }}
                      className="!py-2"
                      style={{
                        backgroundColor: isBtnClicked ? '#3EFEFE' : 'black',
                        color: isBtnClicked ? 'black' : 'white',
                        borderRadius: '40px',
                        boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
                        width: '100px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        transition: 'background 0.1s, color 0.1s',
                      }}
                      title="Ajouter un véhicule"
                    >
                      <PlusCircleIcon size={16} className={isBtnClicked ? 'text-black md:size-5' : 'text-white md:size-5'} />
                      <CarIcon className={isBtnClicked ? 'text-black' : 'text-white'} size={24} />
                      <span className={isBtnClicked ? 'hidden xs:inline text-black md:inline' : 'hidden xs:inline text-white md:inline'}>Ajouter un véhicule</span>
                    </button>
                  </div>
                </div>
         </header>
    <div className="bg-white rounded-lg shadow p-4 mt-4">

       <h2 className="text-xl font-bold mb-4">Livraisons à effectuer</h2>
       <ul className="divide-y divide-gray-200">
        {livraisons.map(livraison => (
          <li key={livraison.id}>
            <LivraisonCard
              voitureId={livraison.voiture}
              client={livraison.conducteur}
              date_livraison={livraison.date_debut}
              date_depot={livraison.date_fin}
              lieu={`Lat: ${livraison.latitude}, Lng: ${livraison.longitude}`}
              statut={livraison.statut}
              latitude={livraison.latitude}
              longitude={livraison.longitude}
              reservationId={livraison.id}
            />
          </li>
        ))}
       </ul>
    </div>
       {/* Mobile bottom navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-[#222]" style={{ borderRadius: '40px 40px 40px 40px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',margin: '0 2px 15px 2px',borderBlockColor: '#222' }}>
              <div className="flex justify-around p-4">
                <button className="flex flex-col items-center gap-1 text-[#3EFEFE]"
                onClick={() => navigate('/owner/dashboard')}>
                  <BarChart3Icon size={20} />
                  <span className="text-xs font-semibold">Dashboard</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-white hover:text-[#3EFEFE]"
                  onClick={() => navigate('/owner/vehicle/OwnerVehicles')}>
                  <CarIcon size={20} />
                  <span className="text-xs">Véhicules</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-white hover:text-[#3EFEFE]" 
                  onClick={() => navigate('/owner/notifications')}>
                  <BellIcon size={20} />
                  <span className="text-xs">Notifications</span>
                </button>
                <button
                  className="flex flex-col items-center gap-1 text-white hover:text-[#3EFEFE]"
                  onClick={() => navigate('/owner/profile')}
                >
                  <UserIcon size={20} />
                  <span className="text-xs">Profil</span>
                </button>
              </div>
            </nav>
    </div>
  );
};

export default LivraisonListPage;
