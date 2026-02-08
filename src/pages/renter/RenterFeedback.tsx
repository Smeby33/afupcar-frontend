import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Feedback {
  feedbackId: string;
  objet: string | null;
  conducteur: string;
  texte: string;
  document: string | null;
  creatAt: string;
}

const RenterFeedback: React.FC = () => {
  const [renterId, setRenterId] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) setRenterId(user.uid);
    else setRenterId(null);
  }, []);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      if (!renterId) return;
      setLoading(true);
      try {
        const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/feedbacks/byConducteur/${renterId}`);
        setFeedbacks(res.data);
      } catch (err) {
        toast.error('Erreur lors de la récupération des feedbacks.');
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, [renterId]);

  if (!renterId) {
    return <div className="p-8 text-center text-red-500">Aucun locataire connecté.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Feedbacks du Locataire</h1>
        <div>
          {loading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          ) : feedbacks.length === 0 ? (
            <div className="text-gray-500 flex flex-col items-center gap-4">Aucun feedback trouvé.
              <button
                type="button"
                onClick={() => navigate('/renter/feedback/new')}
                className="mt-2 px-4 py-2 bg-[#3EFEFE] text-black rounded-full font-bold shadow hover:bg-[#eaff8b] transition flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Ajouter un feedback
              </button>
            </div>
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
                  className="bg-white rounded shadow p-4 cursor-pointer hover:bg-gray-100"
                  onClick={() =>
                    navigate(`/renter/feedback/${encodeURIComponent(fb.objet || fb.feedbackId)}`, {
                      state: { objet: fb.objet, conducteur: fb.conducteur }
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

export default RenterFeedback;
