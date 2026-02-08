import React, { useEffect, useState } from 'react';
import { PencilIcon, Trash2Icon, PlusIcon } from 'lucide-react';
import { FaArrowLeft, FaCar } from 'react-icons/fa';
import axios from 'axios';
import MobileNav from '../MobileNav';
import { useNavigate } from 'react-router-dom';

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

const ModeleCar: React.FC = () => {
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
  const navigate = useNavigate();

  useEffect(() => {
    fetchModeles();
    fetchMarques();
  }, []);

  const fetchModeles = async () => {
    const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/allModels`);
    setModeles(res.data);
  };

  const fetchMarques = async () => {
    const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/allMarques`);
    setMarques(res.data);
  };

  const handleAdd = async () => {
    if (!newMarqueId || !newModele) return;
    await axios.post(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/addModel`, { marqueId: newMarqueId, modele: newModele });
    setNewMarqueId('');
    setNewModele('');
    fetchModeles();
  };

  const handleEdit = async (id: string) => {
    await axios.put(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/model/${id}`, { marqueId: editMarqueId, modele: editModele });
    setEditId(null);
    fetchModeles();
  };

  const handleDelete = async (id: string) => {
    await axios.delete(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/model/${id}`);
    fetchModeles();
  };

  const filteredModeles = modeles.filter(m =>
    (!marqueIdFilter || m.marqueId === marqueIdFilter) &&
    (!search || m.modele.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-gray-900 shadow-md">
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
      {/* Main content */}
      <main className="flex-1 p-4 md:p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Gestion des modèles de véhicules</h2>
        <div className="flex flex-col md:flex-row gap-2 mb-6">
          <select
            value={marqueIdFilter}
            onChange={e => setMarqueIdFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3EFEFE] bg-gray-50 text-gray-800"
          >
            <option value="">Toutes les marques</option>
            {marques.map(mq => (
              <option key={mq.id} value={mq.id}>{mq.nom}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Recherche modèle..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3EFEFE] bg-gray-50 text-gray-800"
          />
        </div>
        <div className="mb-6 flex flex-col md:flex-row gap-2 items-center">
          <select
            value={newMarqueId}
            onChange={e => setNewMarqueId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3EFEFE] bg-gray-50 text-gray-800"
          >
            <option value="">Sélectionner une marque</option>
            {marques.map(mq => (
              <option key={mq.id} value={mq.id}>{mq.nom}</option>
            ))}
          </select>
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
              {filteredModeles.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center text-gray-400 py-6">Aucun modèle trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
      <MobileNav />
    </div>
  );
};

export default ModeleCar;
