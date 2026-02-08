import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapPinIcon } from 'lucide-react';
import MapLivraison from './MapLivraison';
import { toast } from 'sonner';
import ChecklistEtatVoiture from './ChecklistEtatVoiture';
import { useCurrentUser } from '../../services/useCurrentUser';

interface Car {
  id: string;
  marque: string;
  modele: string;
  photofront?: string;
  prix: number;
  prixhorszone?: number | null;
  ville?: string;
}

interface Renter {
  id: string;
  nom?: string;
  prenom?: string;
  email?: string;
  fullname?: string;
  photo?: string;
}

interface LivraisonCardProps {
  voitureId: string;
  client: string;
  date_livraison: string;
  date_depot: string;
  lieu: string;
  statut: string;
  latitude?: string;
  longitude?: string;
  reservationId: string;
}

const  LivraisonCard: React.FC<LivraisonCardProps> = ({ voitureId, client, date_livraison, date_depot, lieu, statut, latitude, longitude, reservationId }) => {
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [renter, setRenter] = useState<Renter | null>(null);
  // États pour la livraison
  const [startLoading, setStartLoading] = useState(false);
  const [startSuccess, setStartSuccess] = useState(false);
  const [startError, setStartError] = useState('');
  const [livraisonEtat, setLivraisonEtat] = useState<string | null>(null);
  // Ajout d'un état pour le chargement de la terminaison
  const [finishLoading, setFinishLoading] = useState(false);
  const [finishError, setFinishError] = useState('');
  // Ajout d'un état pour la vérification de la voiture
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [showChecklist, setShowChecklist] = useState(false);
  const [checklistData, setChecklistData] = useState<{ [key: string]: boolean }>({});
  const [pdfCloudinaryUrl, setPdfCloudinaryUrl] = useState<string | null>(null);
  const { user } = useCurrentUser();

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/car/${voitureId}`);
        setCar(res.data);
      } catch (e) {
        setCar(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [voitureId]);

  useEffect(() => {
    const fetchRenter = async () => {
      if (!client) return;
      try {
        const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/renters/getRenter/${client}`);
        setRenter(res.data);
        console.log('les utilisateurs recues pour les reservations sont', res.data);
      } catch (e) {
        setRenter(null);
      }
    };
    fetchRenter();
  }, [client]);

  useEffect(() => {
    const fetchLivraisonEtat = async () => {
      if (!reservationId) return;
      try {
        const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/livraisons/getLivraison/${reservationId}`);
        setLivraisonEtat(res.data.etat || null);
      } catch (e) {
        setLivraisonEtat(null);
      }
    };
    fetchLivraisonEtat();
  }, [reservationId, startSuccess]); // refresh après création

  const handleStartLivraison = async () => {
    if (!car || !renter) return;
    setStartLoading(true);
    setStartError('');
    try {
      await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/livraisons/addLivraison', {
        id_reservation: reservationId,
        conducteur: renter.id,
        voiture: voitureId,
        livré: 0,
        recuperé: 0,
        verification: 0,
        etat: 'en cours',
      });

      // Notification au conducteur au début de la livraison
      try {
        await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/notifications/addNotification', {
          userId: renter.id,
          type: 'livraison_start',
          title: 'Livraison commencée',
          message: `La livraison de votre véhicule (${car?.marque} ${car?.modele}) a commencé.`,
          link: `/renter/reservations/${reservationId}`,
          meta: {
            voiture: voitureId,
            reservation: reservationId,
            date_livraison,
            lieu
          }
        });
        console.log('[LOG] Notification conducteur début livraison envoyée');
      } catch (notifErr) {
        console.error('[Notification] Erreur notification début livraison:', notifErr);
      }

      setStartSuccess(true);
    } catch (e: any) {
      setStartError(e?.response?.data?.error || "Erreur lors de l'ajout de la livraison.");
    } finally {
      setStartLoading(false);
    }
  };

  // Nouvelle fonction pour terminer la livraison
  const handleFinishLivraison = async () => {
    setFinishLoading(true);
    setFinishError('');
    try {
      await axios.put(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/livraisons/updateLivraison/${reservationId}`, {
        etat: 'livré',
        livré: 1,
      });
      setLivraisonEtat('livré');
      toast.success('Livraison terminée avec succès !');

      // Notification au conducteur à la fin de la livraison
      try {
        await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/notifications/addNotification', {
          userId: renter?.id,
          type: 'livraison_finish',
          title: 'Livraison terminée',
          message: `La livraison de votre véhicule (${car?.marque} ${car?.modele}) est terminée.`,
          link: `/renter/reservations/${reservationId}`,
          meta: {
            voiture: voitureId,
            reservation: reservationId,
            date_depot,
            lieu
          }
        });
        console.log('[LOG] Notification conducteur fin livraison envoyée');
      } catch (notifErr) {
        console.error('[Notification] Erreur notification fin livraison:', notifErr);
      }
    } catch (e: unknown) {
      setFinishError((e as any)?.response?.data?.error || "Erreur lors de la mise à jour de la livraison.");
    } finally {
      setFinishLoading(false);
    }
  };

  const handleVerifyEtatVoiture = () => {
    setShowChecklist(true);
  };

  const handleChecklistSubmit = async () => {
    setVerifyLoading(true);
    setVerifyError('');
    try {
      if (!pdfCloudinaryUrl) {
        setVerifyError('Veuillez générer et uploader le PDF avant de valider.');
        setVerifyLoading(false);
        return;
      }
      // 1. Mettre à jour la livraison
      await axios.put(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/livraisons/updateEtatLivraison/${reservationId}`, {
        etat: 'terminée',
        etatVoiture: 'vérifiée',
        document: pdfCloudinaryUrl,
      });
      setLivraisonEtat('terminée');
      setShowChecklist(false);
      toast.success("État de la voiture vérifié et livraison terminée !");
      // 2. Ajouter un commentaire dans la conversation
      if (user && renter) {
        await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/commentaires/addCommentaire', {
          id_conversation: reservationId,
          auteur: user.uid,
          'auteur-inter': renter.id,
          message: `Bonjour, bienvenue à Lotu. Voici le document de vérification du véhicule : ${pdfCloudinaryUrl}`,
          document: pdfCloudinaryUrl,
        });
      }
    } catch (e: unknown) {
      setVerifyError((e as any)?.response?.data?.error || "Erreur lors de la vérification de la voiture.");
    } finally {
      setVerifyLoading(false);
    }
  };

  if (loading) return <div>Chargement du véhicule...</div>;
  if (!car) return <div>Véhicule introuvable.</div>;

  return (
    <div className="bg-gray-50 rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between mb-4">
      <div className="flex items-center gap-4">
        {car?.photofront && (
          <img src={car.photofront} alt={car.marque + ' ' + car.modele} className="w-24 h-16 object-cover rounded" />
        )}
        <div>
          <div className="font-bold text-lg">{car?.marque} {car?.modele}</div>
          <div className="text-sm text-gray-600">Prix : {car?.prix} XAF</div>
          {car?.ville && <div className="text-sm text-gray-500">Ville : {car.ville}</div>}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500">Conducteur : {renter ? `${renter.prenom || ''} ${renter.nom || ''}`.trim() || renter.fullname : client}</span>
          </div>
          <div className="text-sm text-gray-500">Date de livraison : {new Date(date_livraison).toLocaleDateString()}</div>
          <div className="text-sm text-gray-500">Date de dépot : {new Date(date_depot).toLocaleDateString()}</div>
          {livraisonEtat && (
            <div className="text-sm text-blue-700 font-semibold mt-1">État livraison : {livraisonEtat}</div>
          )}
          {/* Modal Map */}
          {showMap && latitude && longitude && renter && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
              <div className="bg-white rounded-lg shadow-lg p-4 relative w-full max-w-xl">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl font-bold"
                  onClick={() => setShowMap(false)}
                  title="Fermer la carte"
                >
                  ×
                </button>
                <MapLivraison
                  latitude={latitude}
                  longitude={longitude}
                  renterFullname={`${renter.prenom || ''} ${renter.nom || ''}`.trim() || renter.fullname || ''}
                  renterPhoto={renter.photo}
                />
                {/* Bouton Commencer la livraison sous la carte */}
                <div className="w-full flex justify-center mt-4">
                  <button
                    onClick={handleStartLivraison}
                    disabled={startLoading || startSuccess}
                    className={`px-4 py-2 rounded bg-[#3EFEFE] text-black font-bold shadow hover:bg-[#b6e62e] transition ${startLoading ? 'opacity-60' : ''}`}
                  >
                    {startSuccess ? 'Livraison commencée !' : startLoading ? 'Démarrage...' : 'Commencer la livraison'}
                  </button>
                </div>
                {startError && <div className="text-red-600 text-xs mt-1 text-center">{startError}</div>}
              </div>
            </div>
          )}
          
        </div>
      </div>
      <div className="mt-2 md:mt-0 flex justify-between item-center ">
        {/* <span className="inline-block px-3 text-center py-1 rounded bg-yellow-200 text-yellow-800 font-semibold">
          {statut}
        </span> */}
        {/* Bouton Terminer la livraison si état = en cours */}
          {livraisonEtat === 'en cours' && (
            <div className="w-full flex justify-start mt-2">
              <button
                onClick={handleFinishLivraison}
                disabled={finishLoading}
                className={`px-4 py-2 rounded bg-green-500 text-black font-bold shadow hover:bg-green-600 transition ${finishLoading ? 'opacity-60' : ''}`}
              >
                {finishLoading ? 'Terminaison...' : 'Terminer la livraison'}
              </button>
            </div>
          )}
          {finishError && <div className="text-red-600 text-xs mt-1 text-center">{finishError}</div>}
        {/* Bouton Vérifier l'état de la voiture si état = livré */}
          {livraisonEtat === 'livré' && (
            <>
              <div className="w-full flex justify-center mt-2">
                <button
                  onClick={handleVerifyEtatVoiture}
                  disabled={verifyLoading}
                  className={`px-4 py-2 rounded bg-blue-600 text-white font-bold shadow hover:bg-blue-700 transition ${verifyLoading ? 'opacity-60' : ''}`}
                >
                  {verifyLoading ? 'Vérification...' : "Vérifier l'état de la voiture"}
                </button>
              </div>
              {/* Modale checklist */}
              {showChecklist && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                  <div className="bg-white rounded-lg shadow-lg p-6 relative w-full max-w-2xl">
                    <button
                      className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl font-bold"
                      onClick={() => setShowChecklist(false)}
                      title="Fermer la checklist"
                    >
                      ×
                    </button>
                    <h2 className="text-xl font-bold mb-4 text-center">Checklist état du véhicule</h2>
                    <ChecklistEtatVoiture
                      idReservation={reservationId}
                      onChange={setChecklistData}
                      onPdfReady={setPdfCloudinaryUrl}
                      fullnameConducteur={renter?.fullname || renter?.nom || ''}
                    />
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={handleChecklistSubmit}
                        disabled={verifyLoading}
                        className={`px-6 py-2 rounded bg-green-500 text-black font-bold shadow hover:bg-green-600 transition ${verifyLoading ? 'opacity-60' : ''}`}
                      >
                        {verifyLoading ? 'Envoi...' : 'Valider la checklist'}
                      </button>
                    </div>
                    {verifyError && <div className="text-red-600 text-xs mt-2 text-center">{verifyError}</div>}
                  </div>
                </div>
              )}
            </>
          )}
          {latitude && longitude && (
              <button
                type="button"
                className="ml-2 w-10 p-1 pt-4 flex item-center  justify-center rounded-full bg-gray-200 hover:bg-[#3EFEFE] text-gray-700 hover:text-black transition"
                title="Voir la localisation sur la carte"
                onClick={() => setShowMap(true)}
              >
                <MapPinIcon size={18} />
              </button>
    )}
      </div>
    </div>
  );
};

export default LivraisonCard;
