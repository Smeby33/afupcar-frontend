import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { getAuth } from 'firebase/auth';
import LivraisonCard from './LivraisonCard';

interface Livraison {
  id: string;
  voiture: string;
  client: string;
  date_livraison: string;
  lieu: string;
  statut: string;
}

const LivraisonList: React.FC = () => {
  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLivraisons = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          toast.error('Utilisateur non connecté');
          setLoading(false);
          return;
        }
        const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/reservations/livraisons/byOwnerLivree/${user.uid}`);
        setLivraisons(res.data);
      } catch (e) {
        toast.error('Erreur lors du chargement des livraisons à faire');
      } finally {
        setLoading(false);
      }
    };
    fetchLivraisons();
  }, []);

  if (loading) return <div>Chargement des livraisons...</div>;

  if (livraisons.length === 0) return <div>Aucune livraison à effectuer.</div>;

  return (
    <div className="bg-white rounded-lg shadow p-4 mt-4">
      <h2 id='livraison-button' className="text-xl font-bold mb-4">Livraisons à effectuer</h2>
      <ul className="divide-y divide-gray-200">
        {livraisons.map(livraison => (
          <li key={livraison.id}>
            <LivraisonCard
              voitureId={livraison.voiture}
              client={livraison.client}
              date_livraison={livraison.date_livraison}
              lieu={livraison.lieu}
              statut={livraison.statut}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LivraisonList;
