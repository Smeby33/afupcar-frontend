import  { useState } from 'react';
import axios from 'axios';
import Loader from '../ui/Loader';
import { toast } from 'sonner';
import { getAuth } from 'firebase/auth';

interface ReadsOwnerProps {
  onClose: () => void;
  userId?: string | null;
}

const ReadsOwner: React.FC<ReadsOwnerProps> = ({ onClose }) => {
  const [accepted, setAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAccept = async () => {
    setIsSubmitting(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        toast.error('Vous devez être connecté pour accepter les conditions.');
        setIsSubmitting(false);
        return;
      }
      // On suppose que le document CGU a l'ID ou le titre "CGU-Proprietaires"
      await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/legales/addRead', {
        reader: user.uid,
        documents: 'CGU-Proprietaires',
        lu: true
      });
      toast.success('Conditions acceptées. Merci !');
      setAccepted(true);
      setTimeout(() => onClose(), 1000); // ferme la modale après succès
    } catch (err) {
      toast.error("Erreur lors de l'enregistrement de l'acceptation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="max-w-3xl mx-auto p-6 space-y-10 relative bg-white rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
        {/* Bouton de fermeture en haut à droite */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-[#3EFEFE] text-2xl font-bold focus:outline-none"
          aria-label="Fermer"
          style={{ zIndex: 100 }}
        >
          ×
        </button>
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h1 className="text-2xl font-bold text-[#3EFEFE] mb-4">Conditions Générales d’Utilisation (CGU) – Locataires</h1>
          <div className="text-gray-800 space-y-2 text-sm">
            <p>En utilisant la plateforme Lotu Auto (site ou application), vous acceptez les présentes Conditions Générales d’Utilisation (CGU). Veuillez les lire attentivement.</p>
            <ol className="list-decimal ml-6 space-y-1">
              <li>
                <b>Accès et Utilisation</b>
                <ul className="list-disc ml-6">
                  <li>Vous devez être âgé d’au moins 21 ans et détenir un permis de conduire valide pour effectuer une réservation.</li>
                  <li>Vous vous engagez à fournir des informations exactes et à jour lors de l’inscription et des réservations.</li>
                </ul>
              </li>
              <li>
                <b>Réservations</b>
                <ul className="list-disc ml-6">
                  <li>Toute réservation est ferme une fois confirmée et soumise à la Politique d’Annulation de la plateforme.</li>
                  <li>Le paiement intégral est requis pour confirmer une réservation.</li>
                </ul>
              </li>
              <li>
                <b>Obligations du Locataire</b>
                <ul className="list-disc ml-6">
                  <li>Utiliser le véhicule conformément à la loi et aux conditions du contrat de location.</li>
                  <li>Ne pas utiliser le véhicule à des fins interdites (transport rémunéré, compétition, conduite hors route, etc.).</li>
                  <li>Signaler immédiatement via la plateforme tout accident, incident ou dommage survenu pendant la période de location.</li>
                </ul>
              </li>
              <li>
                <b>Paiements et Dépôt de Garantie</b>
                <ul className="list-disc ml-6">
                  <li>Les paiements se font par carte bancaire ou mobile money.</li>
                  <li>Un dépôt de garantie peut être requis selon le véhicule loué.</li>
                  <li>Des frais peuvent être appliqués en cas de retard, d’annulation tardive ou de dommages.</li>
                </ul>
              </li>
              <li>
                <b>Responsabilité</b>
                <ul className="list-disc ml-6">
                  <li>En cas d’accident responsable, vous êtes redevable des frais de réparation. En cas de non-responsabilité prouvée, l’assurance prend en charge les réparations.</li>
                  <li>Les journées d’immobilisation du véhicule sont facturées au tarif journalier.</li>
                </ul>
              </li>
              <li>
                <b>Utilisation de la Plateforme</b>
                <ul className="list-disc ml-6">
                  <li>Toute tentative de contournement de la plateforme pour effectuer des transactions en dehors de celle-ci est strictement interdite et entraînera une suspension de votre compte.</li>
                  <li>Vous acceptez de ne pas partager vos identifiants ni utiliser la plateforme à des fins frauduleuses.</li>
                </ul>
              </li>
              <li>
                <b>Suspension et Résiliation</b>
                <ul className="list-disc ml-6">
                  <li>La plateforme se réserve le droit de suspendre ou résilier un compte en cas de non-respect des présentes CGU.</li>
                </ul>
              </li>
            </ol>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-[#3EFEFE] mb-4">Politique de Confidentialité – Locataire</h1>
          <div className="text-gray-800 space-y-2 text-sm">
            <p>Lotu Auto s’engage à protéger vos données personnelles conformément à la législation en vigueur au Gabon.</p>
            <ol className="list-decimal ml-6 space-y-1">
              <li>
                <b>Données Collectées</b>
                <ul className="list-disc ml-6">
                  <li>Nom, prénom, adresse e-mail, numéro de téléphone</li>
                  <li>Informations sur votre permis de conduire</li>
                  <li>Coordonnées de paiement</li>
                  <li>Historique de réservation et d’utilisation</li>
                </ul>
              </li>
              <li>
                <b>Utilisation des Données</b>
                <ul className="list-disc ml-6">
                  <li>Gérer vos réservations</li>
                  <li>Vérifier votre identité</li>
                  <li>Communiquer avec vous (confirmation, assistance, rappels)</li>
                  <li>Assurer la sécurité des utilisateurs et la prévention des fraudes</li>
                </ul>
              </li>
              <li>
                <b>Partage des Données</b>
                <ul className="list-disc ml-6">
                  <li>Les entreprises de location partenaires (uniquement les données nécessaires à la location)</li>
                  <li>Nos prestataires de paiement et services techniques</li>
                  <li>Les autorités si requis par la loi</li>
                </ul>
              </li>
              <li>
                <b>Sécurité</b>
                <ul className="list-disc ml-6">
                  <li>Nous utilisons des mesures de sécurité techniques et organisationnelles pour protéger vos informations personnelles.</li>
                </ul>
              </li>
              <li>
                <b>Conservation des Données</b>
                <ul className="list-disc ml-6">
                  <li>Vos données sont conservées aussi longtemps que nécessaire pour fournir nos services et respecter nos obligations légales.</li>
                </ul>
              </li>
              <li>
                <b>Vos Droits</b>
                <ul className="list-disc ml-6">
                  <li>Vous pouvez demander l’accès, la correction ou la suppression de vos données personnelles en nous contactant via la plateforme.</li>
                </ul>
              </li>
              <li>
                <b>Consentement</b>
                <ul className="list-disc ml-6">
                  <li>En utilisant la plateforme Lotu Auto, vous consentez à cette politique de confidentialité.</li>
                </ul>
              </li>
            </ol>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-2">
          <input
            type="checkbox"
            id="accept-cgu"
            checked={accepted}
            disabled={accepted || isSubmitting}
            onChange={e => setAccepted(e.target.checked)}
            className="accent-[#3EFEFE] w-5 h-5"
          />
          <label htmlFor="accept-cgu" className="text-gray-700 text-sm">
            J'ai lu et j'accepte les Conditions Générales d’Utilisation.
          </label>
          <button
            onClick={handleAccept}
            disabled={!accepted || isSubmitting}
            className="ml-4 px-4 py-2 rounded bg-[#3EFEFE] text-black font-semibold shadow hover:bg-[#eaff8b] transition disabled:opacity-60"
          >
            {isSubmitting ? 'Enregistrement...' : 'Valider'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadsOwner;
