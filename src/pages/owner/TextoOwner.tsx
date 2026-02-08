import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, X } from 'lucide-react';
import { getAuth } from 'firebase/auth';

interface Commentaire {
  id_commentaire: string;
  id_conversation: string;
  auteur: string;
  'auteur-inter': string;
  message: string;
  document: string;
  timestamp: string;
}

interface RenterInfo {
  id: string;
  nom?: string;
  prenom?: string;
  fullname?: string;
  photo?: string;
}

const TextoOwner: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const renter: RenterInfo | undefined = location.state?.renter;
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const [commentaires, setCommentaires] = useState<Commentaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDoc, setModalDoc] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'pdf' | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [ownerPhoto, setOwnerPhoto] = useState<string | null>(null);

  // Scroll auto vers le bas à chaque nouveau message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [commentaires, loading]);

  useEffect(() => {
    const fetchCommentaires = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/commentaires/allCommentaires/${id}`);
        setCommentaires(res.data);
      } catch (e: any) {
        setError(e.message || 'Erreur API');
      } finally {
        setLoading(false);
      }
    };
    fetchCommentaires();
  }, [id]);

  useEffect(() => {
    if (currentUser?.uid) {
      axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/owners/getOwner/${currentUser.uid}`)
        .then(res => setOwnerPhoto(res.data.picture || null))
        .catch(() => setOwnerPhoto(null));
    }
  }, [currentUser]);

  // Upload fichier sur Cloudinary
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'armada_auto');
    const res = await axios.post('https://api.cloudinary.com/v1_1/dubsfeixa/auto/upload', formData);
    return res.data.secure_url;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !currentUser || !renter || (!newMessage.trim() && !file)) return;
    setSending(true);
    setUploading(true);
    let documentUrl = '';
    try {
      if (file) {
        documentUrl = await uploadToCloudinary(file);
      }
      await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/commentaires/addCommentaire', {
        id_conversation: id,
        auteur: currentUser.uid,
        'auteur-inter': renter.id,
        message: newMessage,
        document: documentUrl,
      });

      // Notification au conducteur (renter)
      try {
        await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/notifications/addNotification', {
          userId: renter.id,
          type: 'commentaire',
          title: 'Nouveau commentaire reçu',
          message: `Vous avez reçu un nouveau commentaire de la part du propriétaire.`,
          link: `/renter/conversations/${id}`,
          meta: {
            conversationId: id,
            ownerId: currentUser.uid,
            message: newMessage,
            document: documentUrl
          }
        });
        console.log('[LOG] Notification conducteur commentaire envoyée');
      } catch (notifErr) {
        console.error('[Notification] Erreur lors de la notification conducteur commentaire:', notifErr);
      }

      setNewMessage('');
      setFile(null);
      // Rafraîchir les messages après envoi
      const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/commentaires/allCommentaires/${id}`);
      setCommentaires(res.data);
    } catch (e: any) {
      setError(e.message || 'Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-0 flex flex-col min-h-screen bg-gray-50">
      {/* Header WhatsApp-like */}
      <div className="flex items-center gap-3 bg-white border-b px-4 py-3 sticky top-0 z-10 shadow-sm">
        <button
          className="p-2 rounded hover:bg-gray-200 transition"
          aria-label="Retour"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {renter?.photo ? (
            <img src={renter.photo} alt={renter.fullname || renter.nom || 'Conducteur'} className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400 text-xl font-bold">{(renter?.prenom?.[0] || renter?.fullname?.[0] || '?').toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-lg truncate">{renter?.fullname || (renter?.prenom ? renter.prenom + ' ' + (renter.nom || '') : 'Conducteur')}</div>
        </div>
      </div>
      <div className="text-gray-700 mb-2 px-4 pt-2">ID de la conversation : <span className="font-mono">{id}</span></div>
      {/* Overlay messages scrollable */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col-reverse" style={{ minHeight: 0, maxHeight: 'calc(100vh - 120px)' }}>
        {loading ? (
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto my-8"></div>
        ) : error ? (
          <div className="text-red-500 px-4">{error}</div>
        ) : commentaires.length === 0 ? (
          <div className="text-gray-500 px-4">Aucun message dans cette conversation.</div>
        ) : (
          <ul className="space-y-3">
            {commentaires.map((c) => {
              const isMe = c.auteur === currentUser?.uid;
              let docUrl = c.document || '';
              if (docUrl && !docUrl.startsWith('http')) {
                docUrl = 'https://' + docUrl.replace(/^https?:\/\//, '');
              }
              const isImage = docUrl && (docUrl.endsWith('.jpg') || docUrl.endsWith('.jpeg') || docUrl.endsWith('.png') || docUrl.endsWith('.gif') || docUrl.endsWith('.webp'));
              const isPdf = docUrl && docUrl.endsWith('.pdf');
              return (
                <li key={c.id_commentaire} className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`} style={{ maxWidth: '100%' }}>
                  {/* Affichage avatar du locataire (renter) à gauche si ce n'est pas moi */}
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-2 mt-auto">
                      {renter?.photo ? (
                        <img src={renter.photo} alt={renter.fullname || renter.nom || 'Conducteur'} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-400 text-base font-bold">{(renter?.prenom?.[0] || renter?.fullname?.[0] || '?').toUpperCase()}</span>
                      )}
                    </div>
                  )}
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} w-auto`} style={{ maxWidth: '80%' }}>
                    <div className={`rounded-2xl px-4 py-2 shadow text-sm break-words ${isMe ? 'bg-blue-500 text-white' : 'bg-white text-gray-900 border'} relative max-w-xs md:max-w-md`} style={{ borderTopLeftRadius: isMe ? 16 : 4, borderTopRightRadius: isMe ? 4 : 16, minWidth: 60 }}>
                      {/* Affiche toujours le message texte, liens masqués */}
                      {c.message && (
                        <span>{c.message.replace(/https?:\/\/\S+/g, '[voir doc]')}</span>
                      )}
                      {/* Affichage document/image sous forme d'icône uniquement, plus de lien direct */}
                      {docUrl && (
                        <div className="mt-2 flex items-center gap-2">
                          {isImage ? (
                            <button type="button" className="focus:outline-none" onClick={() => { setPreviewUrl(docUrl); setPreviewType('image'); }} title="Voir l'image">
                              <img src={docUrl} alt="aperçu" className="w-10 h-10 object-cover rounded shadow border border-gray-200 hover:scale-105 transition-transform" />
                            </button>
                          ) : isPdf ? (
                            <button type="button" className="focus:outline-none" onClick={() => { setPreviewUrl(docUrl); setPreviewType('pdf'); }} title="Voir le PDF">
                              <span className="inline-flex items-center justify-center w-10 h-10 bg-red-100 rounded shadow border border-gray-200">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                              </span>
                            </button>
                          ) : null}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{new Date(c.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  {/* Avatar du propriétaire pour ses propres messages */}
                  {isMe && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden ml-2 mt-auto">
                      {ownerPhoto ? (
                        <img src={ownerPhoto} alt="Moi" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-400 text-base font-bold">M</span>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
            <div ref={messagesEndRef} />
          </ul>
        )}
        {/* Modal d'aperçu document/image */}
        {previewUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" style={{overflowY:'auto'}} onClick={() => setPreviewUrl(null)}>
            <div className="bg-white rounded-lg shadow-lg p-4 max-w-[90vw] max-h-[90vh] relative flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
              <button className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-xl font-bold" onClick={() => setPreviewUrl(null)}><X /></button>
              {previewType === 'image' && previewUrl ? (
                <img src={previewUrl.startsWith('http') ? previewUrl : 'https://' + previewUrl.replace(/^https?:\/\//, '')} alt="aperçu" className="max-w-[80vw] max-h-[70vh] rounded object-contain mb-4" />
              ) : null}
              {previewType === 'pdf' && previewUrl ? (
                <iframe src={previewUrl.startsWith('http') ? previewUrl : 'https://' + previewUrl.replace(/^https?:\/\//, '')} title="Aperçu PDF" className="w-[80vw] h-[70vh] bg-gray-100 rounded mb-4" />
              ) : null}
              {previewUrl && (
                <a href={previewUrl.startsWith('http') ? previewUrl : 'https://' + previewUrl.replace(/^https?:\/\//, '')} download target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition text-sm font-semibold">
                  Télécharger
                  <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Footer barre d'envoi sticky */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t bg-white px-4 py-3 sticky bottom-0 z-10">
        <input
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          id="file-input"
          onChange={e => setFile(e.target.files?.[0] || null)}
          disabled={sending || uploading}
        />
        <label htmlFor="file-input" className="cursor-pointer p-2 rounded-full hover:bg-gray-200 transition" title="Joindre un fichier">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l7.07-7.07a4 4 0 00-5.656-5.657l-7.07 7.07a6 6 0 108.485 8.485l6.364-6.364" /></svg>
        </label>
        {file && (
          <span className="text-xs text-gray-600 max-w-[120px] truncate">{file.name}</span>
        )}
        <input
          type="text"
          className="flex-1 rounded-full border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Écrire un message..."
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          disabled={sending || uploading}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-full font-bold hover:bg-blue-600 transition"
          disabled={sending || uploading || (!newMessage.trim() && !file)}
        >
          {uploading ? 'Envoi...' : 'Envoyer'}
        </button>
      </form>
    </div>
  );
};

export default TextoOwner;
