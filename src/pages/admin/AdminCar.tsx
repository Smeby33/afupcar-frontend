import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CarIcon, ArrowLeftIcon, LayoutDashboardIcon, HomeIcon, UsersIcon, CalendarCheck2Icon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/ui/Loader';

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

const AdminCar: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await axios.get('https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/allCars');
        setCars(response.data);
      } catch (err) {
        setError('Erreur lors du chargement des véhicules');
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const MobileNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-800 flex justify-between items-center px-2 py-1 md:hidden">
      <button onClick={() => navigate('/admin/dashboard')} className="flex flex-col items-center flex-1 py-2">
        <LayoutDashboardIcon className="w-6 h-6 text-[#3EFEFE]" />
        <span className="text-xs text-white font-bold">Dashboard</span>
      </button>
      <button onClick={() => navigate('/admin/owners')} className="flex flex-col items-center flex-1 py-2">
        <HomeIcon className="w-6 h-6 text-[#3EFEFE]" />
        <span className="text-xs text-white font-bold">Owners</span>
      </button>
      <button onClick={() => navigate('/admin/renters')} className="flex flex-col items-center flex-1 py-2">
        <UsersIcon className="w-6 h-6 text-[#3EFEFE]" />
        <span className="text-xs text-white font-bold">Renters</span>
      </button>
      <button onClick={() => navigate('/admin/reservations')} className="flex flex-col items-center flex-1 py-2">
        <CalendarCheck2Icon className="w-6 h-6 text-[#3EFEFE]" />
        <span className="text-xs text-white font-bold">Réservations</span>
      </button>
      <button onClick={() => navigate('/admin/cars')} className="flex flex-col items-center flex-1 py-2">
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
      <div className="w-full md:w-64 bg-gray-900 shadow-md hidden md:block">
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
              Véhicules
            </h2>
            <div className="w-10 h-10 hidden md:block" />
          </div>
          <p className="text-sm text-gray-300 text-center md:text-left mt-2">Gestion des véhicules</p>
        </div>
        <nav className="p-4">
          <ul className="flex md:block gap-2 md:gap-0 justify-between">
            <li className="flex-1">
              <button onClick={() => navigate('/admin/dashboard')} className="w-full flex items-center gap-2 text-left px-4 py-2 rounded font-bold text-white hover:bg-gray-800">
                <LayoutDashboardIcon className="w-5 h-5" />
                <span className="hidden md:inline">Dashboard</span>
              </button>
            </li>
            <li className="flex-1">
              <button onClick={() => navigate('/admin/owners')} className="w-full flex items-center gap-2 text-left px-4 py-2 rounded font-bold text-white hover:bg-gray-800">
                <HomeIcon className="w-5 h-5" />
                <span className="hidden md:inline">Owners</span>
              </button>
            </li>
            <li className="flex-1">
              <button onClick={() => navigate('/admin/renters')} className="w-full flex items-center gap-2 text-left px-4 py-2 rounded font-bold text-white hover:bg-gray-800">
                <UsersIcon className="w-5 h-5" />
                <span className="hidden md:inline">Renters</span>
              </button>
            </li>
            <li className="flex-1">
              <button onClick={() => navigate('/admin/reservations')} className="w-full flex items-center gap-2 text-left px-4 py-2 rounded font-bold text-white hover:bg-gray-800">
                <CalendarCheck2Icon className="w-5 h-5" />
                <span className="hidden md:inline">Réservations</span>
              </button>
            </li>
            <li className="flex-1">
              <button onClick={() => navigate('/admin/cars')} className="w-full flex items-center gap-2 text-left px-4 py-2 rounded font-bold bg-[#3EFEFE] text-black">
                <CarIcon className="w-5 h-5" />
                <span className="hidden md:inline">Cars</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
      {/* Main Content */}
      <div className="flex-1 p-2 md:p-8 bg-white text-black">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Liste des Véhicules</h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-2 rounded-full transition flex items-center justify-center"
            aria-label="Retour"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Marque</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Modèle</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Ville</th>
                {/* <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Prix</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Avance</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Propriétaire</th> */}
                {/* <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Statut</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Carburant</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Com.</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Options</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Photos</th> */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cars.length > 0 ? (
                cars.map(car => (
                  <tr
                    key={car.id}
                    className="cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => navigate(`/admin/car/${car.id}`)}
                  >
                    <td className="px-4 py-2">{car.marque}</td>
                    <td className="px-4 py-2">{car.modele}</td>
                    <td className="px-4 py-2">{car.type}</td>
                    <td className="px-4 py-2">{car.ville}</td>
                    {/* <td className="px-4 py-2">{car.prix} FCFA</td>
                    <td className="px-4 py-2">{car.avance} FCFA</td>
                    <td className="px-4 py-2">{car.proprio}</td> */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="px-4 py-6 text-center text-gray-500">
                    Aucun véhicule trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCar;