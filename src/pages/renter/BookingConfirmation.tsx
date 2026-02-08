import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarIcon, MapPinIcon, ClockIcon, InfoIcon } from 'lucide-react';
import Button from '../../components/ui/Button';
import logoBlanc from '../../../logo-blanc.png';
import axios from 'axios';
import { getAuth } from "firebase/auth";
import Loader from '../../components/ui/Loader';

const BookingConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // id de la voiture
  const [reservation, setReservation] = useState<any>(null);
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        const conducteur = user ? user.uid : null;
        if (!conducteur || !id) return;

        // Récupérer la dernière réservation pour cette voiture et ce conducteur
        const resResa = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/reservations/last/${id}/${conducteur}`);
        setReservation(resResa.data);

        // Récupérer les infos du véhicule
        const resCar = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/car/${id}`);
        setCar(resCar.data);
      } catch (err) {
        // Gère l'erreur ici si besoin
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <Loader />;

  if (!reservation || !car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Aucune réservation trouvée.</p>
      </div>
    );
  }

  // Formatage des dates
  const dateDebut = new Date(reservation.date_debut);
  const dateFin = new Date(reservation.date_fin);
  const nbJours = Math.max(1, Math.ceil((dateFin.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24)));
  const options = { day: '2-digit', month: 'short', year: 'numeric' } as const;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-black text-white p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white"
          >
            ← Retour
          </button>
          <h1 className="text-1xl font-bold text-center flex-1">
            Confirmer la réservation
          </h1>
          <a
            onClick={() => navigate('/renter/dashboard')}
            style={{ minWidth: 60, display: 'flex', justifyContent: 'center' }}
          >
            <img
              src={logoBlanc}
              alt="Logo"
              className="w-12 h-12 object-contain"
              style={{ minWidth: 48, minHeight: 48 }}
            />
          </a>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Détails du véhicule</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div
                className="w-full md:w-48 h-32 bg-cover bg-center rounded-lg"
                style={{
                  backgroundImage: `url(${car.photofront || 'https://images.unsplash.com/photo-1441148345475-03a2e82f9719?ixlib=rb-4.0.3'})`
                }}
              ></div>
              <div>
                <h3 className="text-xl font-bold">{car.marque} {car.modele}</h3>
                <div className="flex items-center gap-2 text-gray-600 mt-1">
                  <MapPinIcon size={16} />
                  <span>{car.ville}</span>
                </div>
                <p className="text-lg font-bold mt-2">{Number(car.prix).toLocaleString()} FCFA/jour</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Détails de la réservation</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CalendarIcon className="text-gray-400" size={20} />
                <div>
                  <p className="font-medium">Dates</p>
                  <p className="text-gray-600">
                    {dateDebut.toLocaleDateString('fr-FR', options)} - {dateFin.toLocaleDateString('fr-FR', options)} ({nbJours} jour{nbJours > 1 ? 's' : ''})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ClockIcon className="text-gray-400" size={20} />
                <div>
                  <p className="font-medium">Horaires</p>
                  <p className="text-gray-600">
                    Prise: {reservation.heuredeprise} - Retour: {reservation.heurederetour}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Récapitulatif des frais</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Location ({nbJours} jour{nbJours > 1 ? 's' : ''})</span>
                <span>{(Number(car.prix) * nbJours).toLocaleString()} FCFA</span>
              </div>
              {reservation.livraison > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Livraison</span>
                  <span>{Number(reservation.livraison).toLocaleString()} FCFA</span>
                </div>
              )}
              {/* <div className="flex justify-between">
                <span className="text-gray-600">TVA (18%)</span>
                <span>{Math.round((Number(car.prix) * nbJours + (reservation.livraison || 0)) * 0.18).toLocaleString()} FCFA</span>
              </div> */}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>{reservation.totale ? Number(reservation.totale).toLocaleString() : ''} FCFA</span>
              </div>
            </div>
          </div>
          <div className="bg-[#3EFEFE] bg-opacity-10 rounded-lg p-4 flex gap-3">
            <InfoIcon className="text-[#3EFEFE] flex-shrink-0" size={24} />
            <p className="text-sm">
              En confirmant, vous acceptez les conditions générales de location
              et la politique d'annulation.
            </p>
          </div>
          <Button
            onClick={async () => {
              // Construction des données pour la facture
              const amount = reservation.totale;
              const external_reference = reservation.id;
              const short_description = `${car.marque} ${car.modele} loué pour ${nbJours} jour${nbJours > 1 ? 's' : ''} à ${Number(reservation.totale).toLocaleString()} FCFA`;
              try {
                const auth = getAuth();
                const user = auth.currentUser;
                const conducteur = user ? user.uid : null;

                // Try to fetch renter details from backend to get the phone/email/name
                let renterData: any = null;
                if (conducteur) {
                  try {
                    const renterRes = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/renters/getRenter/${conducteur}`);
                    renterData = renterRes.data;
                    console.log('[DEBUG] Renter data fetched:', renterData);
                  } catch (err) {
                    console.warn('[DEBUG] Unable to fetch renter data:', err);
                  }
                }

                const payer_email = renterData?.email || user?.email || '';
                const payer_name = renterData?.fullname || renterData?.name || user?.displayName || payer_email.split('@')[0] || 'Client';
                const payer_msisdn = renterData?.phone || reservation.phone || reservation.telephone || user?.phoneNumber || '';

                // return_url: point de retour frontend après paiement (affichage résultat)
                const return_url = `${window.location.origin}/renter/payment-result?ref=${external_reference}`;

                console.log('[DEBUG] createInvoice payload:', { amount, external_reference, short_description, payer_msisdn, payer_email, payer_name, return_url });
                const res = await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/transactions/createInvoice', {
                  amount,
                  external_reference,
                  short_description,
                  payer_msisdn,
                  payer_email,
                  payer_name,
                  return_url
                });

                console.log('[DEBUG] Facture créée:', res.data);

                // Déterminer billId et essayer plusieurs emplacements possibles dans la réponse
                const billId = res.data?.e_bill?.bill_id || res.data?.data?.e_bill?.bill_id || res.data?.data?.bill_id || res.data?.bill_id || null;
                const EBILL_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_EBILLING_PORTAL_URL) ? import.meta.env.VITE_EBILLING_PORTAL_URL : 'https://test.billing-easy.net';

                // Chercher payment_url dans plusieurs schémas attendus
                let paymentUrl = res.data?.payment_url || res.data?.data?.payment_url || res.data?.e_bill?.payment_url || res.data?.data?.e_bill?.payment_url || null;

                // Si aucune URL fournie mais qu'on a le billId, construire un fallback tolérant (avec redirect_url)
                if (!paymentUrl && billId) {
                  const returnUrlEncoded = encodeURIComponent(return_url);
                  paymentUrl = `${EBILL_BASE}?invoice=${billId}&redirect_url=${returnUrlEncoded}`;
                }

                console.log('[DEBUG] paymentUrl final:', paymentUrl, 'billId:', billId);

                if (paymentUrl) {
                  window.location.href = paymentUrl;
                } else {
                  // Fallback: naviguer vers la page payment du front où l'utilisateur peut déclencher la redirection
                  navigate(`/renter/payment/${reservation.id}`, { state: { external_reference } });
                }
              } catch (err) {
                console.error('[DEBUG] Erreur lors de la création de la facture:', err);
                alert('Erreur lors de la création de la facture.');
              }
            }}
            fullWidth
          >
            Procéder au paiement
          </Button>
        </div>
      </main>
    </div>
  );
};

export default BookingConfirmation;