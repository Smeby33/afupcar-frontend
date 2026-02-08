import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import axios from 'axios';

const PaymentResult: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [externalRef, setExternalRef] = useState<string | null>(null);
  const [billId, setBillId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref') || params.get('reference');
    const st = (params.get('status') || params.get('state') || '') as string;
    setExternalRef(ref);
    setStatus(st ? st.toLowerCase() : null);

    const fetchBill = async () => {
      if (!ref) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/transactions/recupererfactureid/${ref}`);
        setBillId(res.data.bill_id);
      } catch (err) {
        setError('Impossible de récupérer le bill_id');
      } finally {
        setLoading(false);
      }
    };
    fetchBill();
  }, [location.search]);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          {status === 'success' || status === 'paid' ? (
            <>
              <h1 className="text-2xl font-bold text-green-600">Paiement réussi</h1>
              <p className="mt-2">Merci — votre paiement a été enregistré.</p>
            </>
          ) : status === 'failed' || status === 'cancelled' ? (
            <>
              <h1 className="text-2xl font-bold text-red-600">Paiement échoué</h1>
              <p className="mt-2">Le paiement n'a pas été confirmé. Vous pouvez réessayer.</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-yellow-600">Statut en attente</h1>
              <p className="mt-2">Le paiement est en cours de traitement. Revenez dans quelques instants.</p>
            </>
          )}

          {externalRef && <p className="mt-4">Référence commande : <strong>{externalRef}</strong></p>}
          {billId && <p className="mt-2">Bill ID : <strong>{billId}</strong></p>}
          {error && <p className="mt-2 text-red-500">{error}</p>}

          <div className="mt-6 flex gap-3 justify-center">
            <Button onClick={() => navigate('/renter/dashboard')}>Retour au tableau de bord</Button>
            <Button onClick={async () => {
              if (!externalRef) return;
              try {
                const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/transactions/recupererfactureid/${externalRef}`);
                setBillId(res.data.bill_id);
                setError(null);
              } catch (err) {
                setError('Erreur lors de la vérification');
              }
            }}>Vérifier</Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentResult;
