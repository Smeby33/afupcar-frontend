import React, { useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";

interface Renter {
  id: string;
  fullname: string;
  email: string;
  phone: string;
  cni: string;
  permis: string;
  photo: string;
  created_at: string;
}

interface AdminRenterCardProps {
  renter: Renter;
  onRenterUpdated?: () => void;
}

const AdminRenterCard: React.FC<AdminRenterCardProps> = ({ renter, onRenterUpdated }) => {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ ...renter });
  const [loading, setLoading] = useState(false);

  // Pour gérer l'upload de fichiers (photo, cni, permis)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'photo' | 'cni' | 'permis') => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Ici tu dois uploader le fichier sur ton serveur ou cloud et récupérer l'URL
    // Pour la démo, on simule juste l'URL locale
    const url = URL.createObjectURL(file);
    setForm(prev => ({ ...prev, [field]: url }));
    // Remplace cette logique par ton upload réel si besoin
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = async () => {
    setLoading(true);
    try {
      await axios.put(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/renters/modifier/renter/${renter.id}`, form);
      setEditMode(false);
      if (onRenterUpdated) onRenterUpdated();
    } catch (err) {
      alert("Erreur lors de la modification");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer ce client ?")) return;
    setLoading(true);
    try {
      await axios.delete(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/renters/deletteRenter/${renter.id}`);
      if (onRenterUpdated) onRenterUpdated();
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
    setLoading(false);
  };

  return (
    <>
      <div className="border border-gray-800 p-3 rounded-lg bg-black flex flex-col items-center w-full max-w-xs mx-auto mb-3 shadow-sm">
        <div>
          {renter.photo ? (
            <img src={renter.photo} alt="Photo du client" className="h-16 w-16 rounded-full object-cover mb-2" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 mb-2">
              Aucune photo
            </div>
          )}
        </div>
        <h3 className="font-bold text-center text-[#3EFEFE]">{renter.fullname}</h3>
        <p className="text-sm text-white text-center">{renter.email}</p>
        <p className="text-sm text-white text-center">{renter.phone}</p>
        <div className="flex flex-col gap-1 mt-2 w-full items-center">
          <a href={renter.cni} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline text-xs font-bold">
            Voir CNI
          </a>
          <a href={renter.permis} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline text-xs font-bold">
            Voir Permis
          </a>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">Inscrit le {new Date(renter.created_at).toLocaleDateString()}</p>
        <div className="flex gap-2 mt-2">
          <button onClick={() => setEditMode(true)} className="bg-[#3EFEFE] text-black font-bold p-2 rounded-full" title="Modifier">
            <FaEdit />
          </button>
          <button onClick={handleDelete} disabled={loading} className="bg-red-600 text-white p-2 rounded-full" title="Supprimer">
            <FaTrash />
          </button>
        </div>
      </div>

      {/* Modal d'édition */}
      {editMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 overflow-y-auto">
          <div
            className="bg-white rounded-lg p-4 w-[75vw]  max-w-lg max-h-[90vh] relative mx-2 sm:mx-0 overflow-y-auto"
            style={{ minWidth: 280, minHeight: 350 }}
          >
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
              onClick={() => setEditMode(false)}
              title="Fermer"
            >
              <FaTimes />
            </button>
            <h2 className="text-xl font-bold mb-4 text-[#3EFEFE]">Modifier le client</h2>
            <div className="flex flex-col items-center mb-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden mb-2 bg-gray-200">
                {form.photo ? (
                  <img src={form.photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FaEdit size={32} />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-black text-white p-1 rounded-full cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'photo')}
                    accept="image/*"
                  />
                  <FaEdit size={16} />
                </label>
              </div>
              <p className="text-sm text-gray-500 mb-2">Cliquez sur l'icône pour changer la photo</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 mb-1">Nom complet</label>
                <input
                  type="text"
                  name="fullname"
                  value={form.fullname}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-gray-100"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">CNI/Passeport</label>
                {form.cni ? (
                  <a
                    href={form.cni}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline inline-block"
                  >
                    {form.cni.endsWith('.pdf') ? (
                      <span className="inline-block my-2">Voir le document PDF</span>
                    ) : (
                      <img
                        src={form.cni}
                        alt="Document CNI/Passeport"
                        className="max-h-32 rounded border my-2"
                      />
                    )}
                    Voir le document
                  </a>
                ) : (
                  <p className="text-gray-400">Aucun document</p>
                )}
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e, 'cni')}
                  accept="image/*,.pdf"
                  className="mt-2"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Permis de conduire</label>
                {form.permis ? (
                  <a
                    href={form.permis}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline inline-block"
                  >
                    <img
                      src={form.permis}
                      alt="Permis de conduire"
                      className="max-h-32 rounded border my-2"
                    />
                    Voir le permis
                  </a>
                ) : (
                  <p className="text-gray-400">Aucun permis</p>
                )}
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e, 'permis')}
                  accept="image/*,.pdf"
                  className="mt-2"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setEditMode(false)}
                className="bg-gray-200 px-6 py-2 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={handleEdit}
                disabled={loading}
                className="bg-black text-[#3EFEFE] px-6 py-2 rounded-lg font-medium"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminRenterCard;