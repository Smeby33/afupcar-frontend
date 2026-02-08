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
          <h1 className="text-2xl font-bold text-[#3EFEFE] mb-4">Conditions Générales d’Utilisation (CGU) – Propriétaires</h1>
          <div className="text-gray-800 space-y-2 text-sm">
            <p>En inscrivant un ou plusieurs véhicules sur la plateforme Lotu, vous acceptez les présentes Conditions Générales d’Utilisation. Merci de les lire attentivement.</p>
            <ol className="list-decimal ml-6 space-y-1">
              <li>
                <b>Éligibilité</b>
                <ul className="list-disc ml-6">
                  <li>Seules les entreprises légalement enregistrées au Gabon peuvent proposer des véhicules à la location.</li>
                  <li>Les véhicules doivent être assurés, immatriculés, en bon état de fonctionnement et entretenus régulièrement.</li>
                </ul>
              </li>
              <li>
                <b>Dépôt et Gestion des Annonces</b>
                <ul className="list-disc ml-6">
                  <li>Vous êtes responsable de la véracité des informations fournies sur chaque véhicule (photos, prix, disponibilité, conditions spécifiques).</li>
                  <li>Lotu se réserve le droit de modifier ou suspendre une annonce en cas de non-conformité.</li>
                </ul>
              </li>
              <li>
                <b>Obligations du Propriétaire</b>
                <ul className="list-disc ml-6">
                  <li>Remettre un véhicule propre, en bon état et conforme à l’annonce.</li>
                  <li>S’assurer que le contrat standard est respecté et que le locataire reçoit les documents nécessaires (carte grise, assurance, état des lieux).</li>
                  <li>Répondre aux demandes via la plateforme dans un délai raisonnable.</li>
                </ul>
              </li>
              <li>
                <b>Paiements et Commission</b>
                <ul className="list-disc ml-6">
                  <li>Le montant de la location est collecté par Lotu. La plateforme reverse les fonds aux propriétaires déduction faite de la commission convenue.</li>
                  <li>Les paiements sont effectués selon la fréquence définie.</li>
                </ul>
              </li>
              <li>
                <b>Dépôt de Garantie</b>
                <ul className="list-disc ml-6">
                  <li>Lotu gère le dépôt de garantie selon le type de véhicule. En cas de dommage, le propriétaire doit soumettre les justificatifs pour une éventuelle retenue.</li>
                </ul>
              </li>
              <li>
                <b>Responsabilités</b>
                <ul className="list-disc ml-6">
                  <li>Le propriétaire s’engage à ne pas traiter de réservation en dehors de la plateforme.</li>
                  <li>Toute tentative de contact ou de paiement direct avec un locataire peut entraîner une suspension du compte.</li>
                </ul>
              </li>
              <li>
                <b>Résiliation</b>
                <ul className="list-disc ml-6">
                  <li>Lotu peut suspendre ou résilier un compte propriétaire en cas de non-respect des présentes CGU ou de plaintes répétées de locataires.</li>
                </ul>
              </li>
            </ol>
          </div>
          
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-[#3EFEFE] mb-4">Politique de Confidentialité – Locataire</h1>
          <div className="text-gray-800 space-y-2 text-sm">
            <p>Lotu s’engage à protéger vos données personnelles conformément à la législation en vigueur au Gabon.</p>
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
                  <li>En utilisant la plateforme Lotu, vous consentez à cette politique de confidentialité.</li>
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
