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

const Conversationsrenter: React.FC = () => {
  const { user, loading } = useCurrentUser();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [lastMessages, setLastMessages] = useState<{ [id: string]: LastMessage | null }>({});
  const [owners, setOwners] = useState<{ [id: string]: any | null }>({});
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user || loading) return;
      setFetching(true);
      setError(null);
      try {
        const response = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/commentaires/conversations/byAuteurInter/${user.uid}`);
        console.log('[DEBUG] Fetching conversations for user:', user.uid);
        setConversations(response.data);
        console.log('[DEBUG] Conversations reçues pour renter:', response.data);
        // Pour chaque conversation, fetch le dernier message et le conducteur
        const lastMsgObj: { [id: string]: LastMessage | null } = {};
        const ownersObj: { [id: string]: RenterInfo | null } = {};
        await Promise.all(
          response.data.map(async (conv: Conversation) => {
            // Dernier message
            let auteurId: string | undefined = undefined;
            try {
              const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/commentaires/lastMessage/${conv.id_conversation}`);
              lastMsgObj[conv.id_conversation] = res.data;
              auteurId = res.data.auteur;
              console.log(`[DEBUG] Last message for conversation ${conv.id_conversation}:`, res.data);
            } catch {
              lastMsgObj[conv.id_conversation] = null;
              console.log(`[DEBUG] No last message for conversation ${conv.id_conversation}`);
            }
            // Infos propriétaire (prendre l'id de l'auteur du lastMessage, mais il doit être différent du currentUser)
            let ownerId = auteurId;
            if (ownerId === user?.uid) {
              // Si l'auteur est le currentUser, alors le propriétaire est l'autre participant (auteur-inter)
              ownerId = lastMsgObj[conv.id_conversation]?.['auteur-inter'];
            }
            if (ownerId) {
              try {
                const resOwner = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/owners/getOwner/${ownerId}`);
                ownersObj[ownerId] = resOwner.data;
                console.log(`[DEBUG] Owner for ownerId ${ownerId}:`, resOwner.data);
              } catch {
                ownersObj[ownerId] = null;
                console.log(`[DEBUG] No owner found for ownerId ${ownerId}`);
              }
            } else {
              console.log(`[DEBUG] Pas de champ 'auteur' ou 'auteur-inter' pour le lastMessage de la conversation ${conv.id_conversation}`);
            }
          })
        );
        setLastMessages(lastMsgObj);
        setOwners(ownersObj);
        console.log('[DEBUG] Renters final:', ownersObj);
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
            // Correction : l'auteur du propriétaire doit être différent du currentuser
            let auteurId = lastMsg?.auteur;
            if (auteurId === user?.uid) {
              // Si l'auteur du lastMsg est le currentUser, alors le propriétaire est l'autre participant (auteur-inter)
              auteurId = lastMsg?.['auteur-inter'];
            }
            const owner = auteurId ? owners[auteurId] : null;
            console.log('[DEBUG] Render conversation:', {
              id_conversation: conv.id_conversation,
              auteur: auteurId,
              owner,
              lastMsg
            });
            return (
              <li
                key={conv.id_conversation}
                className="flex items-center gap-3 p-3 bg-white rounded shadow border-l-4 border-blue-400 cursor-pointer hover:bg-blue-50 transition"
                onClick={() => navigate(`/renter/texto/${conv.id_conversation}`, { state: { owner } })}
              >
                {/* Photo company owner */}
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {owner?.picture ? (
                    <img src={owner.picture} alt={owner.companyname || owner.fullname || owner.nom || 'Propriétaire'} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-xl font-bold">{(owner?.companyname?.[0] || owner?.fullname?.[0] || '?').toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{owner?.companyname || owner?.fullname || owner?.nom || auteurId}</div>
                  {lastMsg ? (
                    <div className="text-gray-700 truncate max-w-xs">{lastMsg.message}</div>
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

export default Conversationsrenter;
