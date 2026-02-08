import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CarIcon, PlusCircleIcon, SearchIcon, FilterIcon, ArrowLeftIcon, CreditCardIcon,BellIcon, UserIcon, BarChart3Icon } from 'lucide-react'; // Ajoute ArrowLeftIcon
import Button from '../../components/ui/Button';
import VehicleCard from '../../components/owner/VehicleCard';
import { auth } from '../../pages/firebaseConfig';
import axios from 'axios';
import { toast } from 'sonner';

interface Vehicle {
  id: string;
  marque: string;
  modele: string;
  photofront: string;
  prix: number;
  prixhorszone?: number | null;
  statut: 0 | 1; // 0 = disponible, 1 = en location
  ville: string;
}
const OwnerVehicles: React.FC = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'disponible' | 'en location'>('all');
  const [reservations, setReservations] = useState<any[]>([]);
  const [cars, setCars] = useState<{ [key: string]: any }>({});
  const [reservationsLoading, setReservationsLoading] = useState(true);
  const [isBtnClicked, setIsBtnClicked] = useState(false);

  useEffect(() => {
    const fetchOwnerVehicles = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          toast.error('Vous devez être connecté');
          navigate('/owner/login');
          return;
        }

        const response = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/cars/byOwner/${currentUser.uid}`);
        setVehicles(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des véhicules:", error);
        toast.error("Erreur lors du chargement des véhicules");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOwnerVehicles();
  }, [navigate]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/reservations/reservations/proprietaire/${currentUser.uid}`);
        setReservations(res.data);

        // Charger les infos voitures associées
        const carIds = Array.from(new Set(res.data.map((r: any) => r.voiture)));
        const carsData: { [key: string]: any } = {};
        await Promise.all(
          carIds.map(async (carId) => {
            try {
              const carRes = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/car/${carId}`);
              carsData[carId] = carRes.data;
            } catch (e) {
              carsData[carId] = null;
            }
          })
        );
        setCars(carsData);
      } catch (err) {
        setReservations([]);
      } finally {
        setReservationsLoading(false);
      }
    };
    fetchReservations();
  }, []);

  const filteredVehicles = vehicles.filter(vehicle => {
    // Recherche
    const matchesSearch =
      vehicle.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.modele.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.ville.toLowerCase().includes(searchTerm.toLowerCase());

    // Statut
    let matchesFilter = true;
    if (filter === 'disponible') matchesFilter = vehicle.statut === 0;
    if (filter === 'en location') matchesFilter = vehicle.statut === 1;

    return matchesSearch && matchesFilter;
  });

  const getStatusCount = (status: 'disponible' | 'en location' | 'indisponible') => {
    if (status === 'disponible') {
      // Véhicules qui ne sont pas en cours de consommation ni confirmés
      return vehicles.filter(vehicle => {
        // On cherche s'il y a une réservation active ou confirmée pour ce véhicule
        const hasActiveReservation = reservations.some(r =>
          r.voiture === vehicle.id &&
          ['En cours', 'Confirmée'].includes(getReservationStatus(r.statut, r.date_debut, r.date_fin))
        );
        return !hasActiveReservation;
      }).length;
    }
    if (status === 'en location') {
      // Véhicules qui ont une réservation en cours de consommation
      return vehicles.filter(vehicle =>
        reservations.some(r =>
          r.voiture === vehicle.id &&
          getReservationStatus(r.statut, r.date_debut, r.date_fin) === 'En cours'
        )
      ).length;
    }
    if (status === 'indisponible') {
      // Véhicules qui ont une réservation confirmée mais pas encore en consommation
      return vehicles.filter(vehicle =>
        reservations.some(r =>
          r.voiture === vehicle.id &&
          getReservationStatus(r.statut, r.date_debut, r.date_fin) === 'Confirmée'
        )
      ).length;
    }
    return 0;
  };

  const getReservationStatus = (statut: number, dateDebut: string, dateFin: string) => {
    const today = new Date();
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);

    if (statut === 1 && today >= debut && today <= fin) return 'En cours';
    if (statut === 1 && fin < today) return 'Terminée';
    if (statut === 0 && fin < today) return 'Annulée';
    if (statut === 1) return 'Confirmée';
    return 'En attente';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-100 shadow text-white p-4 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setIsBtnClicked(true);
                setTimeout(() => {
                  const section = document.getElementById('reservations');
                  if (section) section.scrollIntoView({ behavior: 'smooth' });
                }, 120);
              }}
              className="!py-2"
              style={{
                backgroundColor: isBtnClicked ? '#3EFEFE' : 'black',
                color: isBtnClicked ? 'black' : 'white',
                borderRadius: '40px',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
                width: '60px', // Encore plus petit
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.1s, color 0.1s',
              }}
              title="Voir les réservations"
            >
              <CreditCardIcon size={18} className={isBtnClicked ? 'text-black' : 'text-white'} />
              <CarIcon className={isBtnClicked ? 'text-black' : 'text-white'} size={20} />
            </button>

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
                setTimeout(() => navigate('/owner/add-vehicle'), 120);
              }}
              className="!py-2"
              style={{
                backgroundColor: isBtnClicked ? '#3EFEFE' : 'black',
                color: isBtnClicked ? 'black' : 'white',
                borderRadius: '40px',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
                width: '60px', // Encore plus petit
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.1s, color 0.1s',
              }}
              title="Ajouter un véhicule"
            >
              <PlusCircleIcon size={18} className={isBtnClicked ? 'text-black' : 'text-white'} />
              <CarIcon className={isBtnClicked ? 'text-black' : 'text-white'} size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 mb-20 ">
        {/* Stats and Filters */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-100 p-2 rounded-lg text-center">
              <p className="text-1xl font-bold">{vehicles.length}</p>
              <p className="text-gray-600 text-sm">Total</p>
            </div>
            <div className="bg-green-50 p-2 rounded-lg text-center">
              <p className="text-1xl font-bold text-green-600">{getStatusCount('disponible')}</p>
              <p className="text-gray-600 text-sm">Disponibles</p>
            </div>
            <div className="bg-yellow-50 p-2 rounded-lg text-center">
              <p className="text-1xl font-bold text-yellow-600">{getStatusCount('en location')}</p>
              <p className="text-gray-600 text-sm">En location</p>
            </div>
            <div className="bg-red-50 p-2 rounded-lg text-center">
              <p className="text-1xl font-bold text-red-600">{getStatusCount('indisponible')}</p>
              <p className="text-gray-600 text-sm">Indisponibles</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher par marque, modèle ou ville..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-100 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3EFEFE]"
              />
            </div>
            <div className="relative">
              <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="bg-gray-100 rounded-lg pl-10 pr-4 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-[#3EFEFE]"
              >
                <option value="all">Tous les statuts</option>
                <option value="disponible">Disponibles</option>
                <option value="en location">En location</option>
                <option value="indisponible">Indisponibles</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Vehicles List */}
        {filteredVehicles.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <CarIcon className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-xl font-bold mb-2">
              {searchTerm || filter !== 'all' 
                ? "Aucun véhicule ne correspond à votre recherche" 
                : "Vous n'avez aucun véhicule enregistré"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filter !== 'all'
                ? "Essayez de modifier vos critères de recherche"
                : "Commencez par ajouter votre premier véhicule"}
            </p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/owner/add-vehicle')}
              className="mx-auto"
            >
              <PlusCircleIcon size={20} className="mr-2" />
              Ajouter un véhicule
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => {
              // On cherche la réservation la plus "prioritaire" pour ce véhicule
              const reservation = reservations.find(r => r.voiture === vehicle.id &&
                ['En cours', 'Confirmée'].includes(getReservationStatus(r.statut, r.date_debut, r.date_fin))
              );
              let realStatus: 'disponible' | 'consommation' | 'confirmed' = 'disponible';
              if (reservation) {
                const status = getReservationStatus(reservation.statut, reservation.date_debut, reservation.date_fin);
                if (status === 'En cours') realStatus = 'consommation';
                else if (status === 'Confirmée') realStatus = 'confirmed';
              }

              return (
                <VehicleCard
                  key={vehicle.id}
                  id={vehicle.id}
                  name={`${vehicle.marque} ${vehicle.modele}`}
                  price={vehicle.prix}
                  prixhorszone={vehicle.prixhorszone}
                  image={vehicle.photofront}
                  status={realStatus} // Passe le vrai statut
                  location={vehicle.ville}
                  onClick={() => navigate(`/owner/vehicle/${vehicle.id}`)}
                />
              );
            })}
          </div>
        )}
         {/* Reservations Section */}
        {reservationsLoading ? (
          <div className="text-center py-8">
            <p>Chargement des réservations...</p>
          </div>
        ) : (
          <div id="reservations" className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Réservations sur mes véhicules</h2>
            {reservations.length === 0 ? (
              <p className="text-gray-500">Aucune réservation trouvée.</p>
            ) : (
              <div className="space-y-4">
                {reservations.map((r) => (
                  <div key={r.id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {cars[r.voiture]?.photofront && (
                        <img src={cars[r.voiture].photofront} alt="Voiture" className="w-24 h-16 object-cover rounded" />
                      )}
                      <div>
                        <div className="font-semibold">{cars[r.voiture]?.marque} {cars[r.voiture]?.modele}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(r.date_debut).toLocaleDateString()} au {new Date(r.date_fin).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">Réf: {r.id}</div>
                      </div>
                    </div>
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-semibold">
                        {getReservationStatus(r.statut, r.date_debut, r.date_fin)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
       
      </main>
      {/* Barre de navigation mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-[#222]" style={{ borderRadius: '40px 40px 40px 40px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',margin: '0 2px 15px 2px',borderBlockColor: '#222' }}>
              <div className="flex justify-around p-3">
                <button  onClick={() => navigate('/owner/dashboard')} className="flex flex-col items-center gap-1 text-white text-[#3EFEFE]">
                  <BarChart3Icon size={18} />
                  <span className="text-xs font-semibold">Dashboard</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-[#3EFEFE]"
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

export default OwnerVehicles;