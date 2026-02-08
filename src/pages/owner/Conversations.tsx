import React, { useEffect, useState } from 'react';
import { EditIcon } from '../../components/ui/Icons';
import { useCurrentUser } from '../../services/useCurrentUser';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Conversation {
  id_conversation: string;
  'auteur-inter'?: string;
}

interface LastMessage {
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

const Conversations: React.FC = () => {
  const { user, loading } = useCurrentUser();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [lastMessages, setLastMessages] = useState<{ [id: string]: LastMessage | null }>({});
  const [renters, setRenters] = useState<{ [id: string]: RenterInfo | null }>({});
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user || loading) return;
      setFetching(true);
      setError(null);
      try {
        const response = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/commentaires/conversations/byAuteur/${user.uid}`);
        setConversations(response.data);
        console.log('[DEBUG] Conversations reçues:', response.data);
        // Pour chaque conversation, fetch le dernier message et le conducteur
        const lastMsgObj: { [id: string]: LastMessage | null } = {};
        const rentersObj: { [id: string]: RenterInfo | null } = {};
        await Promise.all(
          response.data.map(async (conv: Conversation) => {
            // Dernier message
            let auteurInterId: string | undefined = undefined;
            try {
              const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/commentaires/lastMessage/${conv.id_conversation}`);
              lastMsgObj[conv.id_conversation] = res.data;
              auteurInterId = res.data['auteur-inter'];
              console.log(`[DEBUG] Last message for conversation ${conv.id_conversation}:`, res.data);
            } catch {
              lastMsgObj[conv.id_conversation] = null;
              console.log(`[DEBUG] No last message for conversation ${conv.id_conversation}`);
            }
            // Infos conducteur (prendre l'id du locataire, qui est l'autre participant)
            let renterId = auteurInterId;
            if (renterId === user?.uid) {
              // Si l'auteur-inter est le currentUser (propriétaire), alors le locataire est l'auteur du message
              renterId = lastMsgObj[conv.id_conversation]?.auteur;
            }
            if (renterId && renterId !== user?.uid) {
              try {
                const resRenter = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/renters/getRenter/${renterId}`);
                console.log('[DEBUG] Données récupérées pour le renter:', resRenter.data);
                rentersObj[renterId] = resRenter.data;
                console.log(`[DEBUG] Renter for id ${renterId}:`, resRenter.data);
              } catch {
                rentersObj[renterId] = null;
                console.log(`[DEBUG] No renter found for id ${renterId}`);
              }
            } else {
              console.log(`[DEBUG] Pas de locataire à récupérer pour la conversation ${conv.id_conversation}`);
            }
          })
        );
        setLastMessages(lastMsgObj);
        setRenters(rentersObj);
        console.log('[DEBUG] Renters final:', rentersObj);
      } catch (e: any) {
        setError(e.message || 'Erreur API');
      } finally {
        setFetching(false);
      }
    };
    fetchConversations();
  }, [user, loading]);

  if (loading) return <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <EditIcon className="w-7 h-7 text-blue-400" /> Conversations
      </h1>
      {fetching ? (
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : conversations.length === 0 ? (
        <div className="text-gray-500">Aucune conversation trouvée.</div>
      ) : (
        <ul className="space-y-2">
          {conversations.map((conv) => {
            const lastMsg = lastMessages[conv.id_conversation];
            // Correction : l'auteur du propriétaire doit être différent du currentUser
            let auteurId = lastMsg?.auteur;
            if (auteurId === user?.uid) {
              // Si l'auteur du lastMsg est le currentUser, alors le propriétaire est l'autre participant (auteur-inter)
              auteurId = lastMsg?.['auteur-inter'];
            }
            const owner = auteurId ? renters[auteurId] : null;
            // Masquer les liens dans l'aperçu du dernier message
            let lastMsgPreview = lastMsg?.message || '';
            if (lastMsgPreview) {
              lastMsgPreview = lastMsgPreview.replace(/https?:\/\/\S+/g, '[voir doc]');
            }
            return (
              <li
                key={conv.id_conversation}
                className="flex items-center gap-3 p-3 bg-white rounded shadow border-l-4 border-blue-400 cursor-pointer hover:bg-blue-50 transition"
                onClick={() => navigate(`/owner/texto/${conv.id_conversation}`, { state: { renter: owner } })}
              >
                {/* Photo propriétaire */}
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {owner?.photo ? (
                    <img src={owner.photo} alt={owner.fullname || owner.nom || 'Propriétaire'} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-xl font-bold">{(owner?.fullname?.[0] || owner?.nom?.[0] || '?').toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{owner?.fullname || owner?.nom || auteurId}</div>
                  {lastMsg ? (
                    <div className="text-gray-700 truncate max-w-xs">{lastMsgPreview}</div>
                  ) : (
                    <div className="text-xs text-gray-400">Aucun message</div>
                  )}
                </div>
                {lastMsg && (
                  <div className="text-xs text-gray-400 whitespace-nowrap ml-2">{new Date(lastMsg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Conversations;
