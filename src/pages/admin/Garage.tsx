import React, { useEffect, useState } from 'react';
import { PencilIcon, Trash2Icon, PlusIcon } from 'lucide-react';
import { FaArrowLeft, FaCar } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { toast } from 'sonner';
import { LayoutDashboard as LayoutDashboardIcon, Home as HomeIcon, Users as UsersIcon, CalendarCheck2 as CalendarCheck2Icon, Car as CarIcon } from 'lucide-react';

const API_BASE = 'https://qxmaqyf9jt.us-east-1.awsapprunner.com';

interface Modele {
  id: string;
  marqueId: string;
  modele: string;
}

interface Marque {
  id: string;
  nom: string;
}

const Garage: React.FC = () => {
  const [modeles, setModeles] = useState<Modele[]>([]);
  const [marques, setMarques] = useState<Marque[]>([]);
  const [search, setSearch] = useState('');
  const [marqueIdFilter, setMarqueIdFilter] = useState('');
  const [newMarqueId, setNewMarqueId] = useState('');
  const [newModele, setNewModele] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editModele, setEditModele] = useState('');
  const [editMarqueId, setEditMarqueId] = useState('');
  const [activeTab, setActiveTab] = useState('modeles');
  const [cars, setCars] = useState<any[]>([]);
  const [marqueSearch, setMarqueSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchModeles();
    fetchMarques();
    fetchCars();
  }, []);

  const fetchModeles = async () => {
    const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/allModels`);
    setModeles(res.data);
  };

  const fetchMarques = async () => {
    const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/allMarques`);
    setMarques(res.data);
  };

  const fetchCars = async () => {
    const res = await axios.get('https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/allCars');
    setCars(res.data);
  };

  const handleAdd = async () => {
    if (!newMarqueId || !newModele) {
      toast.error('Veuillez sélectionner une marque et saisir au moins un modèle.');
      return;
    }
    const modelesToAdd = newModele.split(',').map(m => m.trim()).filter(Boolean);
    let successCount = 0;
    let errorCount = 0;
    for (const modele of modelesToAdd) {
      try {
        await axios.post(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/addModel`, { marqueId: newMarqueId, modele });
        successCount++;
      } catch (err) {
        errorCount++;
      }
    }
    setNewModele('');
    fetchModeles();
    if (successCount > 0) toast.success(`${successCount} modèle(s) ajouté(s) avec succès !`);
    if (errorCount > 0) toast.error(`${errorCount} modèle(s) n'ont pas pu être ajoutés.`);
  };

  const handleEdit = async (id: string) => {
    try {
      await axios.put(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/model/${id}`, { marqueId: editMarqueId, modele: editModele });
      setEditId(null);
      fetchModeles();
      toast.success('Modèle modifié avec succès !');
    } catch (err) {
      toast.error('Erreur lors de la modification du modèle.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/model/${id}`);
      fetchModeles();
      toast.success('Modèle supprimé avec succès !');
    } catch (err) {
      toast.error('Erreur lors de la suppression du modèle.');
    }
  };

  const filteredModeles = modeles.filter(m =>
    (!marqueIdFilter || m.marqueId === marqueIdFilter) &&
    (!search || m.modele.toLowerCase().includes(search.toLowerCase()))
  );

  // Filtrer les voitures selon la marque sélectionnée (par nom)
  const filteredCars = cars.filter(car =>
    !marqueIdFilter ||
    car.marque === marqueIdFilter
  );

  // Utilise uniquement les marques récupérées par /allMarques pour les filtres
  const allMarquesOptions = marques;
  const filteredMarquesOptions = allMarquesOptions.filter(mq =>
    mq.nom.toLowerCase().includes(marqueSearch.toLowerCase())
  );

  // Pour react-select : transformer les marques en options { value, label }
  const marqueOptions = [{ value: '', label: 'Toutes les marques' }, ...marques.map(mq => ({ value: mq.nom, label: mq.nom }))];
  const selectedMarque = marqueOptions.find(opt => opt.value === (marques.find(mq => mq.id === marqueIdFilter)?.nom || marqueIdFilter)) || marqueOptions[0];
  const newMarqueOption = marqueOptions.find(opt => opt.value === newMarqueId) || null;

  // Pour react-select : options pour les modèles filtrés par marque
  const modeleOptions = filteredModeles.map(m => ({ value: m.id, label: m.modele }));
  const [selectedModeleId, setSelectedModeleId] = useState('');
  const selectedModele = modeleOptions.find(opt => opt.value === selectedModeleId) || null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar Desktop */}
      <div className="w-full md:w-64 bg-gray-900 shadow-md hidden md:block">
        <div className="p-4 border-b border-gray-800 flex flex-col md:block items-center">
          <div className="flex w-full items-center justify-between md:block">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-[#3EFEFE] text-black font-bold hover:bg-[#b6e62f] transition flex items-center justify-center w-10 h-10"
              aria-label="Retour"
            >
              <FaArrowLeft />
            </button>
            <h2 className="text-xl font-bold text-[#3EFEFE] text-right flex-1 md:text-left">
              Modèles véhicules
            </h2>
            <div className="w-10 h-10 hidden md:block" />
          </div>
          <p className="text-sm text-gray-300 text-center md:text-left mt-2">Gestion des modèles</p>
        </div>
        <nav className="p-4">
          <ul className="flex md:block gap-2 md:gap-0 justify-between">
            <li className="flex-1">
              <button
                onClick={() => setActiveTab('modeles')}
                className={`w-full flex items-center gap-2 text-left px-4 py-2 rounded font-bold ${activeTab === 'modeles' ? 'bg-[#3EFEFE] text-black' : 'text-white hover:bg-gray-800'}`}
              >
                <FaCar className="md:hidden" />
                <span className="hidden md:inline">Modèles</span>
              </button>
            </li>
            {/* Ajoute d'autres tabs si besoin */}
          </ul>
        </nav>
      </div>
      {/* Vue mobile dédiée */}
      <section className="w-full md:hidden flex flex-col p-4 gap-4">
        <header className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-[#3EFEFE] text-black font-bold hover:bg-[#b6e62f] transition flex items-center justify-center w-10 h-10"
            aria-label="Retour"
          >
            <FaArrowLeft />
          </button>
          <h2 className="text-lg font-bold text-[#3EFEFE]">Modèles véhicules</h2>
        </header>
        <div className="flex flex-col gap-2">
          <Select
            options={marqueOptions}
            value={selectedMarque}
            onChange={option => setMarqueIdFilter(option ? option.value : '')}
            placeholder="Filtrer par marque..."
            isClearable
            classNamePrefix="react-select"
          />
          <input
            type="text"
            placeholder="Recherche modèle..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3EFEFE] bg-gray-50 text-gray-800"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Select
            options={marqueOptions.slice(1)}
            value={newMarqueOption}
            onChange={option => setNewMarqueId(option ? option.value : '')}
            placeholder="Sélectionner une marque"
            isClearable
            classNamePrefix="react-select"
          />
          <input
            type="text"
            placeholder="Nouveau modèle (ex: Swift, Vitara)"
            value={newModele}
            onChange={e => setNewModele(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3EFEFE] bg-gray-50 text-gray-800"
          />
          <button onClick={handleAdd} className="flex items-center justify-center gap-1 bg-[#3EFEFE] hover:bg-lime-400 text-black font-semibold px-4 py-2 rounded-lg shadow transition">
            <PlusIcon size={18} /> Ajouter
          </button>
        </div>
        <div className="overflow-x-auto mt-2">
          <table className="min-w-full border rounded-lg overflow-hidden text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border text-left">Marque</th>
                <th className="p-2 border text-left">Modèle</th>
                <th className="p-2 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredModeles.map(m => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="p-2 border">
                    {editId === m.id ? (
                      <select value={editMarqueId} onChange={e => setEditMarqueId(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1">
                        {marques.map(mq => (
                          <option key={mq.id} value={mq.id}>{mq.nom}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="font-medium text-gray-800">{marques.find(mq => mq.id === m.marqueId)?.nom || m.marqueId}</span>
                    )}
                  </td>
                  <td className="p-2 border">
                    {editId === m.id ? (
                      <input value={editModele} onChange={e => setEditModele(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1" />
                    ) : (
                      <span className="text-gray-700">{m.modele}</span>
                    )}
                  </td>
                  <td className="p-2 border flex gap-1 justify-center">
                    {editId === m.id ? (
                      <>
                        <button onClick={() => handleEdit(m.id)} className="text-blue-600 font-semibold hover:underline">OK</button>
                        <button onClick={() => setEditId(null)} className="text-gray-400 hover:underline">Annuler</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditId(m.id); setEditModele(m.modele); setEditMarqueId(m.marqueId); }} className="text-blue-600 hover:bg-blue-100 p-1 rounded transition"><PencilIcon size={16} /></button>
                        <button onClick={() => handleDelete(m.id)} className="text-red-600 hover:bg-red-100 p-1 rounded transition"><Trash2Icon size={16} /></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {filteredModeles.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center text-gray-400 py-4">Aucun modèle trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      {/* Main content Desktop */}
      <main className="flex-1 p-4 md:p-8 hidden md:block">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Gestion des modèles de véhicules</h2>
        <div className="flex flex-col md:flex-row gap-2 mb-6">
          <div className="flex flex-col w-full md:w-auto">
            
            <div className="w-full md:w-64">
              <Select
                options={marqueOptions}
                value={selectedMarque}
                onChange={option => setMarqueIdFilter(option ? option.value : '')}
                placeholder="Filtrer par marque..."
                isClearable
                classNamePrefix="react-select"
              />
            </div>
          </div>
          <input
            type="text"
            placeholder="Recherche modèle..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3EFEFE] bg-gray-50 text-gray-800"
          />
        </div>
        <div className="mb-6 flex flex-col md:flex-row gap-2 items-center">
          <Select
            options={marqueOptions.slice(1)}
            value={newMarqueOption}
            onChange={option => setNewMarqueId(option ? option.value : '')}
            placeholder="Sélectionner une marque"
            isClearable
            classNamePrefix="react-select"
          />
          <input
            type="text"
            placeholder="Nouveau modèle"
            value={newModele}
            onChange={e => setNewModele(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3EFEFE] bg-gray-50 text-gray-800"
          />
          <button onClick={handleAdd} className="flex items-center gap-1 bg-[#3EFEFE] hover:bg-lime-400 text-black font-semibold px-4 py-2 rounded-lg shadow transition">
            <PlusIcon size={18} /> Ajouter
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 border text-left">Marque</th>
                <th className="p-3 border text-left">Modèle</th>
                <th className="p-3 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCars.map(car => (
                <tr key={car.id} className="hover:bg-gray-50">
                  <td className="p-3 border">{car.marque}</td>
                  <td className="p-3 border">{car.modele}</td>
                  <td className="p-3 border flex gap-2 justify-center">-</td>
                </tr>
              ))}
              {filteredModeles.map(m => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="p-3 border">
                    {editId === m.id ? (
                      <select value={editMarqueId} onChange={e => setEditMarqueId(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1">
                        {marques.map(mq => (
                          <option key={mq.id} value={mq.id}>{mq.nom}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="font-medium text-gray-800">{marques.find(mq => mq.id === m.marqueId)?.nom || m.marqueId}</span>
                    )}
                  </td>
                  <td className="p-3 border">
                    {editId === m.id ? (
                      <input value={editModele} onChange={e => setEditModele(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1" />
                    ) : (
                      <span className="text-gray-700">{m.modele}</span>
                    )}
                  </td>
                  
                  <td className="p-3 border flex gap-2 justify-center">
                    {editId === m.id ? (
                      <>
                        <button onClick={() => handleEdit(m.id)} className="text-blue-600 font-semibold hover:underline">Enregistrer</button>
                        <button onClick={() => setEditId(null)} className="text-gray-400 hover:underline">Annuler</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditId(m.id); setEditModele(m.modele); setEditMarqueId(m.marqueId); }} className="text-blue-600 hover:bg-blue-100 p-1 rounded transition"><PencilIcon size={18} /></button>
                        <button onClick={() => handleDelete(m.id)} className="text-red-600 hover:bg-red-100 p-1 rounded transition"><Trash2Icon size={18} /></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {cars.length === 0 && filteredModeles.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-gray-400 py-6">Aucune voiture ou modèle trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
      {/* MobileNav intégré directement ici */}
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
    </div>
  );
};

export default Garage;

