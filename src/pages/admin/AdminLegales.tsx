import { useEffect, useState } from 'react';
import { PlusIcon, Trash2Icon, EditIcon, FileTextIcon } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import Loader from '../../components/ui/Loader';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import cloudinaryConfig from '../../services/cloudinaryConfig';

interface LegaleDoc {
  legaleId: string;
  titre: string;
  documents: string;
  create_at: string;
}

const AdminLegales: React.FC = () => {
  const navigate = useNavigate();
  const [legales, setLegales] = useState<LegaleDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editDoc, setEditDoc] = useState<LegaleDoc | null>(null);
    const [form, setForm] = useState({ titre: '', documents: '' });
  const [uploading, setUploading] = useState(false);

  // Récupération des documents légaux
  const fetchLegales = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://qxmaqyf9jt.us-east-1.awsapprunner.com/legales/all');
      setLegales(res.data);
    } catch (err) {
      toast.error('Erreur lors du chargement des documents légaux');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLegales(); }, []);

  // Gestion du formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Upload Cloudinary
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/auto/upload`,
        formData
      );
      setForm(f => ({ ...f, documents: res.data.secure_url }));
      toast.success('Document uploadé avec succès');
    } catch (err) {
      toast.error('Erreur lors de l’upload Cloudinary');
    } finally {
      setUploading(false);
    }
  };

  // Ajout ou modification
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titre || !form.documents) {
      toast.error('Tous les champs sont requis');
      return;
    }
    try {
      if (editDoc) {
        await axios.put(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/legales/update/${editDoc.legaleId}`, {
          titre: form.titre,
          documents: form.documents,
        });
        toast.success('Document légal modifié');
      } else {
        await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/legales/add', form);
        toast.success('Document légal ajouté');
      }
      setShowForm(false);
      setEditDoc(null);
      setForm({ titre: '', documents: '' });
      fetchLegales();
    } catch (err) {
      toast.error("Erreur lors de l'enregistrement du document légal");
    }
  };

  // Préparation de l'édition
  const handleEdit = (doc: LegaleDoc) => {
    setEditDoc(doc);
    setForm({ titre: doc.titre, documents: doc.documents });
    setShowForm(true);
  };

  // Suppression
  const handleDelete = async (legaleId: string) => {
    if (!window.confirm('Supprimer ce document légal ?')) return;
    try {
      await axios.delete(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/legales/delete/${legaleId}`);
      toast.success('Document légal supprimé');
      fetchLegales();
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className="min-h-screen bg-black p-6">
      {/* Mobile: flèche à gauche, nom à droite */}
      <div className="flex w-full items-center justify-between md:block mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-[#3EFEFE] text-black font-bold hover:bg-[#b6e62f] transition flex items-center justify-center w-10 h-10"
          aria-label="Retour"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-[#3EFEFE] text-right flex-1 md:text-left">
          Documents légaux
        </h2>
        <div className="w-10 h-10 hidden md:block" />
      </div>
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-1xl font-bold text-[#3EFEFE]">Tous les Documents légaux</h1>
          <button
            onClick={() => { setShowForm(true); setEditDoc(null); setForm({ titre: '', documents: '' }); }}
            className="flex items-center gap-2 px-2 py-2 rounded bg-[#3EFEFE] text-black font-semibold shadow hover:bg-[#eaff8b] transition"
          >
            <PlusIcon className="h-5 w-5" /> <FileTextIcon className="h-5 w-5" />
          </button>
        </div>
        {loading ? <Loader /> : (
          legales.length === 0 ? (
            <div className="text-gray-400 text-center py-8">Aucun document légal</div>
          ) : (
            <ul className="space-y-4">
              {legales.map(doc => (
                <li key={doc.legaleId} className="bg-gray-900 rounded-lg p-4 flex justify-between items-center border border-gray-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileTextIcon className="text-[#3EFEFE]" />
                      <span className="font-bold text-white">{doc.titre}</span>
                    </div>
                    <div className="text-gray-400 text-xs mt-1">Ajouté le {new Date(doc.create_at).toLocaleDateString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(doc)} className="p-2 rounded hover:bg-gray-800" title="Modifier"><EditIcon className="w-5 h-5 text-blue-400" /></button>
                    <button onClick={() => handleDelete(doc.legaleId)} className="p-2 rounded hover:bg-gray-800" title="Supprimer"><Trash2Icon className="w-5 h-5 text-red-400" /></button>
                  </div>
                </li>
              ))}
            </ul>
          )
        )}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8 w-full max-w-md shadow-lg space-y-4">
              <h2 className="text-xl font-bold mb-2 text-[#3EFEFE]">{editDoc ? 'Modifier' : 'Ajouter'} un document légal</h2>
              {/* Suppression du champ legaleId */}
              <input
                type="text"
                name="titre"
                placeholder="Titre"
                value={form.titre}
                onChange={handleChange}
                className="w-full border rounded px-4 py-2 focus:border-[#3EFEFE] focus:outline-none"
                required
              />
              <div className="space-y-2">
                <label className="block text-gray-700 font-semibold">Document (PDF, image...)</label>
                <input type="file" accept=".pdf,image/*" onChange={handleFileUpload} className="w-full" />
                {uploading && <div className="text-sm text-gray-500">Upload en cours...</div>}
                {form.documents && (
                  <a href={form.documents} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">Voir le document</a>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => { setShowForm(false); setEditDoc(null); }} className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold">Annuler</button>
                <button type="submit" className="px-4 py-2 rounded bg-[#3EFEFE] text-black font-semibold" disabled={uploading}>{editDoc ? 'Modifier' : 'Ajouter'}</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLegales;
