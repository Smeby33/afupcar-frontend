import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, Trash2Icon, LayoutDashboardIcon, HomeIcon, UsersIcon, CalendarCheck2Icon, CarIcon } from 'lucide-react';
import Loader from '../../components/ui/Loader';

interface Owner {
  id: string;
  companyname: string;
  picture: string;
  fullname: string;
  email: string;
}

interface OwnerWithCars extends Owner {
  carCount: number;
}

const AdminOwners: React.FC = () => {
  const [owners, setOwners] = useState<OwnerWithCars[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error('Administrateur non connecté');

        const response = await axios.get('https://qxmaqyf9jt.us-east-1.awsapprunner.com/owners/getAllOwners');
        const ownersData: Owner[] = response.data;

        const ownersWithCars: OwnerWithCars[] = await Promise.all(
          ownersData.map(async (owner) => {
            try {
              const carRes = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/owners/countCars/${owner.id}`);
              return { ...owner, carCount: carRes.data.carCount || 0 };
            } catch {
              return { ...owner, carCount: 0 };
            }
          })
        );
        setOwners(ownersWithCars);
      } catch (err) {
        setError('Erreur lors du chargement des propriétaires');
      } finally {
        setLoading(false);
      }
    };

    fetchOwners();
  }, []);

  const handleDelete = async (ownerId: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce propriétaire ?')) return;
    try {
      await axios.delete(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/owners/deleteOwner/${ownerId}`);
      setOwners(owners.filter(owner => owner.id !== ownerId));
      toast.success('Propriétaire supprimé avec succès.');
    } catch (err) {
      toast.error('Erreur lors de la suppression.');
      console.error('Erreur suppression:', err);
    }
  };

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
    <div className="container mx-auto p-6 pb-16">
      <MobileNav />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Liste des Propriétaires</h1>
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
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entreprise</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propriétaire</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre de voitures</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-black text-[#3EFEFE] divide-y divide-gray-200">
            {owners.length > 0 ? (
              owners.map((owner) => (
                <tr
                  key={owner.id}
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() => navigate(`/admin/owners/${owner.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {owner.picture ? (
                      <img src={owner.picture} alt="logo entreprise" className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <span className="text-gray-400">Aucune</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{owner.companyname}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{owner.fullname}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{owner.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">{owner.carCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleDelete(owner.id)}
                      className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                    >
                      <Trash2Icon className="w-5 h-5" />
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Aucun propriétaire trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOwners;