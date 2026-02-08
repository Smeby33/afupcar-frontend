import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';
import { uploadToCloudinary } from '../../services/cloudinaryUpload';

interface Feedback {
  feedbackId: string;
  objet: string | null;
  proprietaire: string;
  texte: string;
  document: string | null;
  creatAt: string;
}

interface AdminFeedbackProps {
  proprietaireId: string;
  objetId?: string;
}

const AdminFeedback: React.FC<AdminFeedbackProps> = (props) => {
  const location = useLocation();
  // Récupère les props soit via props, soit via location.state
  const proprietaireId = props.proprietaireId || location.state?.proprietaire;
  const objetId = props.objetId || location.state?.objet;
  console.log('[DEBUG] Props AdminFeedback:', { proprietaireId, objetId });

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [texte, setTexte] = useState('');
  const [objet, setObjet] = useState('');
  const [document, setDocument] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedObjet, setSelectedObjet] = useState<string | null>(objetId || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Récupérer les feedbacks du propriétaire
  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/feedbacks/byProprietaire/${proprietaireId}`);
      setFeedbacks(res.data);
      console.log('[DEBUG] Feedbacks reçus:', res.data);
    } catch (err) {
      toast.error('Erreur lors de la récupération des feedbacks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (proprietaireId) fetchFeedbacks();
    // eslint-disable-next-line
  }, [proprietaireId]);

  // Si objetId change (navigation), synchronise selectedObjet
  useEffect(() => {
    if (objetId) setSelectedObjet(objetId);
  }, [objetId]);

  // Envoyer un feedback
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texte.trim()) {
      toast.error('Le texte du feedback est requis.');
      return;
    }
    try {
      await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/feedbacks/addProprietaire', {
        proprietaire: proprietaireId,
        texte,
        objet: selectedObjet || objet,
        document: document || null,
      });
      toast.success('Feedback envoyé !');
      setTexte('');
      if (!selectedObjet) setObjet('');
      setDocument('');
      fetchFeedbacks();
    } catch (err) {
      toast.error("Erreur lors de l'envoi du feedback.");
    }
  };

  // Sélectionner un objet existant (mode conversation)
  const handleSelectObjet = (objet: string | null) => {
    if (objet) setSelectedObjet(objet);
  };

  // Réinitialiser la sélection d'objet
  const handleResetObjet = () => {
    setSelectedObjet(null);
    setObjet('');
  };

  // Objets distincts pour suggestions (optionnel)
  const objetsExistants = Array.from(new Set(feedbacks.filter(fb => fb.objet).map(fb => fb.objet!)));

  // Ajout gestion upload Cloudinary
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadToCloudinary(file);
    if (url) setDocument(url);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-2xl mx-auto p-4 flex flex-col h-[100vh] bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="p-2 rounded-full hover:bg-gray-200 transition"
          title="Retour"
        >
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left">
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-center flex-1 border-b pb-2">Feedbacks du propriétaire</h2>
      </div>
      <button>
        
      </button>
      {selectedObjet && (
        <div className="mb-2 flex items-center gap-2 bg-green-100 px-3 py-2 rounded justify-between">
          <div>
            <span className="font-semibold">Conversation sur :</span>
            <span className="text-green-700 font-bold ml-2">{selectedObjet}</span>
          </div>
          <button onClick={handleResetObjet} className="text-xs text-red-500 underline">Changer d'objet</button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-2 py-4 bg-gray-50 rounded mb-2 border">
        {loading ? (
          <div className="text-center text-gray-400">Chargement...</div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center text-gray-400">Aucun feedback trouvé.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {feedbacks
              .filter(fb => !selectedObjet || fb.objet === selectedObjet)
              .map((fb, idx, arr) => {
                const isMine = fb.proprietaire === proprietaireId;
                return (
                  <div
                    key={fb.feedbackId}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-2xl shadow text-sm whitespace-pre-line break-words
                        ${isMine ? 'bg-[#3EFEFE] text-black rounded-br-none' : 'bg-white border rounded-bl-none'}`}
                      style={{ border: isMine ? '2px solid #3EFEFE' : '1px solid #e5e7eb' }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {fb.objet && !selectedObjet && (
                          <span className="text-xs text-green-600 font-semibold">{fb.objet}</span>
                        )}
                        <span className="text-xs text-gray-400">{new Date(fb.creatAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div>{fb.texte}</div>
                      {fb.document && (
                        <a href={fb.document} target="_blank" rel="noopener noreferrer" className="block text-blue-500 underline text-xs mt-1">Voir le document</a>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 bg-gray-100 p-3 rounded-lg border-t">
        {!selectedObjet && (
          <input
            type="text"
            placeholder="Objet (optionnel)"
            value={objet}
            onChange={e => setObjet(e.target.value)}
            className="w-full px-3 py-2 rounded border border-gray-300"
            list="objets-existants"
          />
        )}
        <datalist id="objets-existants">
          {objetsExistants.map(obj => (
            <option value={obj} key={obj} />
          ))}
        </datalist>
        <div className="flex gap-2 items-end">
          <div className="relative flex-1 flex items-end">
            <textarea
              placeholder="Votre message..."
              value={texte}
              onChange={e => setTexte(e.target.value)}
              className="w-full px-4 py-2 rounded-2xl border border-gray-300 resize-none shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3EFEFE] bg-white pr-14"
              rows={2}
              maxLength={1000}
              required
              style={{ minHeight: 44, maxHeight: 100 }}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <label htmlFor="file-upload" className="inline-flex items-center justify-center w-7 h-7 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300 transition">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-3A2.25 2.25 0 008.25 5.25V9m7.5 0v10.5a2.25 2.25 0 01-2.25 2.25h-3A2.25 2.25 0 018.25 19.5V9m7.5 0H8.25" />
                </svg>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
              </label>
              {/* <input
                type="text"
                placeholder="Lien doc (optionnel)"
                value={document}
                onChange={e => setDocument(e.target.value)}
                className="w-32 px-2 py-1 rounded border border-gray-200 text-xs bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#3EFEFE] ml-1"
                style={{ fontSize: 12 }}
              /> */}
            </div>
          </div>
          <button
            type="submit"
            className=" text-black px-4 py-2 rounded-full font-bold  hover:bg-[#eaff8b] transition flex items-center gap-1"
            style={{ minHeight: 44 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21l16.5-9-16.5-9v7.5l11.25 1.5-11.25 1.5V21z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminFeedback;
