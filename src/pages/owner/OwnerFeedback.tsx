import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { HeadsetIcon } from 'lucide-react';


interface Feedback {
  feedbackId: string;
  objet: string | null;
  proprietaire: string;
  texte: string;
  document: string | null;
  creatAt: string;
}

const OwnerFeedback: React.FC = () => {
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) setOwnerId(user.uid);
    else setOwnerId(null);
  }, []);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      if (!ownerId) return;
      setLoading(true);
      try {
        const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/feedbacks/byProprietaire/${ownerId}`);
        setFeedbacks(res.data);
      } catch (err) {
        toast.error('Erreur lors de la récupération des feedbacks.');
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, [ownerId]);

  if (!ownerId) {
    return <div className="p-8 text-center text-red-500">Aucun propriétaire connecté.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2"><HeadsetIcon className="w-7 h-7 text-green-500" />Feedbacks</h1>
        <div>
          {loading ? (
            <div>Chargement...</div>
          ) : feedbacks.length === 0 ? (
            <div className="text-gray-500">Aucun feedback trouvé.</div>
          ) : (
            <ul className="space-y-3">
              {Object.values(
                feedbacks.reduce((acc, fb) => {
                  // On garde le dernier feedback pour chaque objet (ou feedbackId si pas d'objet)
                  const key = fb.objet || fb.feedbackId;
                  if (!acc[key] || new Date(fb.creatAt) > new Date(acc[key].creatAt)) {
                    acc[key] = fb;
                  }
                  return acc;
                }, {} as { [key: string]: Feedback })
              ).map(fb => (
                <li
                  key={fb.feedbackId}
                  className="bg-white rounded border-l-4 border-green-400 shadow p-4 cursor-pointer hover:bg-gray-100"
                  onClick={() =>
                    navigate(`/owner/feedback/${encodeURIComponent(fb.objet || fb.feedbackId)}`, {
                      state: { objet: fb.objet, proprietaire: fb.proprietaire }
                    })
                  }
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{fb.objet || 'Sans objet'}</span>
                    <span className="text-xs text-gray-400">{new Date(fb.creatAt).toLocaleString()}</span>
                  </div>
                  <div className="text-gray-700 mt-1 line-clamp-2">{fb.texte}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerFeedback;
