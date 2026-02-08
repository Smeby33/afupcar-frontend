
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { CreditCardIcon, SmartphoneIcon, LockIcon } from 'lucide-react';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import axios from 'axios';
import { getAuth } from "firebase/auth";
import { toast } from 'sonner'; // Ajout de l'import du toast de sonner

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // id de la réservation
  const location = useLocation();
  const external_reference = location.state?.external_reference;
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentType, setSelectedPaymentType] = useState<'carte' | 'mobile' | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);
  const [billId, setBillId] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        if (!id) return;
        const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/reservations/reservationvoiture/${id}`);
        setReservation(res.data);
      } catch (err) {
        // Optionnel : gérer l'erreur
      } finally {
        setLoading(false);
      }
    };
    fetchReservation();
  }, [id]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        const conducteur = user ? user.uid : null;
        if (!conducteur) return;
        const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/paiements/getPaiement/conducteur/${conducteur}`);
        setPayments(res.data);
        console.log('Payments fetched:', res.data);
      } catch (err) {
        // Optionnel : gérer l'erreur
      }
    };
    fetchPayments();
  }, []);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        const conducteur = user ? user.uid : null;
        if (!conducteur) return;
        const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/paiements/getPaiement/conducteur/${conducteur}`);
        setPaymentMethods(res.data);
      } catch (err) {
        // Optionnel : gérer l'erreur
      }
    };
    fetchPaymentMethods();
  }, []);

  useEffect(() => {
    if (!external_reference) return;
    const fetchBillId = async () => {
      try {
        const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/transactions/recupererfactureid/${external_reference}`);
        setBillId(res.data.bill_id);
        console.log('[DEBUG] Bill ID récupéré:', res.data.bill_id);
        // Affiche le toast seulement si bill_id est bien défini
        if (res.data.bill_id) {
          setTimeout(() => {
            toast('Veuillez proceder au paiement pour continuer.'); // Utilisation du toast de sonner
          }, 100); // petit délai pour s'assurer que le DOM est prêt
        }
      } catch (err) {
        setBillId(null);
        console.error('[DEBUG] Erreur lors de la récupération du bill_id:', err);
      }
    };
    fetchBillId();
  }, [external_reference]);

  // Correction du filtre pour accepter 'carte' OU 'visa' OU 'mastercard' pour le type carte bancaire
  const isCard = (pm: any) => pm.type === 'carte' || pm.type === 'visa' || pm.type === 'mastercard';
  const isMobile = (pm: any) => pm.type === 'mobile';

  if (loading) return <Loader />;

  if (!reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Réservation non trouvée.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white mb-4">
            ← Retour
          </button>
          <h1 className="text-2xl font-bold">Paiement</h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Montant à payer</h2>
            <div className="text-3xl font-bold">
              {Number(reservation.totale).toLocaleString()} FCFA
            </div>
          </div>
          {/* <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Mode de paiement</h2>
            <div className="space-y-4">
              <div
                className={`border rounded-lg p-4 cursor-pointer hover:border-[#3EFEFE] ${selectedPaymentType === 'carte' ? 'border-[#3EFEFE] bg-[#f7ffe0]' : ''}`}
                onClick={() => setSelectedPaymentType('carte')}
              >
                <div className="flex items-center gap-3">
                  <CreditCardIcon className="text-gray-400" size={24} />
                  <div>
                    <p className="font-medium">Carte bancaire</p>
                    <p className="text-sm text-gray-600">Visa, Mastercard</p>
                  </div>
                </div>
              </div>
              <div
                className={`border rounded-lg p-4 cursor-pointer hover:border-[#3EFEFE] ${selectedPaymentType === 'mobile' ? 'border-[#3EFEFE] bg-[#f7ffe0]' : ''}`}
                onClick={() => setSelectedPaymentType('mobile')}
              >
                <div className="flex items-center gap-3">
                  <SmartphoneIcon className="text-gray-400" size={24} />
                  <div>
                    <p className="font-medium">Mobile Money</p>
                    <p className="text-sm text-gray-600">
                      Airtel Money, Moov Money
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div> */}

          {/* Affichage dynamique des moyens de paiement selon le type sélectionné */}
          {selectedPaymentType && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Sélectionnez un moyen de paiement ({selectedPaymentType === 'carte' ? 'Carte bancaire' : 'Mobile Money'})</h2>
              {paymentMethods.filter(pm => selectedPaymentType === 'carte' ? isCard(pm) : isMobile(pm)).length === 0 ? (
                <p className="text-gray-500">Aucun moyen de paiement {selectedPaymentType === 'carte' ? 'carte bancaire' : 'mobile money'} enregistré.</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {paymentMethods.filter(pm => selectedPaymentType === 'carte' ? isCard(pm) : isMobile(pm)).map((pm, idx) => (
                    <li
                      key={idx}
                      className={`py-2 flex flex-col md:flex-row md:justify-between md:items-center cursor-pointer rounded ${selectedPaymentMethod && selectedPaymentMethod.id === pm.id ? 'bg-[#3EFEFE]/20 border border-[#3EFEFE]' : ''}`}
                      onClick={() => setSelectedPaymentMethod(pm)}
                    >
                      <div>
                        <span className="font-medium">{isCard(pm) ? 'Carte bancaire' : 'Mobile Money'}</span>
                        <span className="ml-2 text-gray-500 text-sm">{pm.reseau}</span>
                        <span className="ml-2 text-gray-700">{pm.numero}</span>
                        {pm.expire_date && (
                          <span className="ml-2 text-gray-400 text-xs">Exp: {pm.expire_date}</span>
                        )}
                      </div>
                      <div className="text-gray-500 text-xs mt-1 md:mt-0">{pm.fullname}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Affichage des détails du moyen de paiement sélectionné */}
          {selectedPaymentMethod && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Détails du paiement sélectionné</h2>
              <div className="space-y-2">
                <div><span className="font-medium">Type :</span> {selectedPaymentMethod.type === 'carte' ? 'Carte bancaire' : selectedPaymentMethod.type === 'mobile' ? 'Mobile Money' : selectedPaymentMethod.type}</div>
                <div><span className="font-medium">Réseau :</span> {selectedPaymentMethod.reseau}</div>
                <div><span className="font-medium">Numéro :</span> {selectedPaymentMethod.numero}</div>
                {selectedPaymentMethod.expire_date && (
                  <div><span className="font-medium">Expiration :</span> {selectedPaymentMethod.expire_date}</div>
                )}
                <div><span className="font-medium">Titulaire :</span> {selectedPaymentMethod.fullname}</div>
                {/* Affiche le champ CVC si c'est une carte visa */}
                {selectedPaymentMethod.type === 'visa' && (
                  <div className="mt-2">
                    <label className="block text-gray-600 mb-2">Code CVC</label>
                    <input type="text" placeholder="123" className="w-full px-4 py-2 border rounded-lg focus:border-[#3EFEFE] focus:outline-none" maxLength={4} />
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Historique de vos paiements</h2>
            {payments.length === 0 ? (
              <p className="text-gray-500">Aucun paiement trouvé.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {payments.map((p, idx) => (
                  <li key={idx} className="py-2 flex justify-between items-center">
                    <span className="font-medium">{p?.montant ? Number(p.montant).toLocaleString() + ' FCFA' : 'Montant inconnu'}</span>
                    <span className="text-gray-500 text-sm">{p?.date_paiement ? new Date(p.date_paiement).toLocaleDateString() : ''}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <LockIcon size={16} />
            <span>Paiement sécurisé avec cryptage SSL</span>
          </div>
          <Button
            onClick={async () => {
              // if (!selectedPaymentMethod) {
              //   toast.error('Veuillez sélectionner un moyen de paiement.');
              //   return;
              // }
              if (!billId) {
                toast.error('Impossible de récupérer la facture.');
                return;
              }
              try {
                // Appel à la route backend pour préparer la redirection (optionnel, selon votre logique)
                // const res = await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/redirectToEbilling', { invoice_number: billId });
                // Si le backend retourne une URL, utilisez-la. Sinon, on fait le POST direct côté front :
                const EBILLING_PORTAL_URL = 'https://test.billing-easy.net';
                const EB_CALLBACK_URL = 'https://qxmaqyf9jt.us-east-1.awsapprunner.com/transactions/updateFactureStatus'; // À personnaliser
                // Création d'un formulaire temporaire pour POST
                const form = document.createElement('form');   
                form.method = 'POST';
                form.action = EBILLING_PORTAL_URL;
                form.style.display = 'none';
                // Paramètre invoice_number
                const invoiceInput = document.createElement('input');
                invoiceInput.type = 'hidden';
                invoiceInput.name = 'invoice_number';
                invoiceInput.value = billId;
                form.appendChild(invoiceInput);
                // Paramètre eb_callbackurl
                const callbackInput = document.createElement('input');
                callbackInput.type = 'hidden';
                callbackInput.name = 'eb_callbackurl';
                callbackInput.value = EB_CALLBACK_URL;
                form.appendChild(callbackInput);
                document.body.appendChild(form);
                form.submit();
              } catch (err) {
                toast.error('Erreur lors de la redirection vers le portail de paiement.');
              }
            }}
            fullWidth
          >
            Payer maintenant
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Payment;