import  { useState } from 'react';
import OwnerRegistration from './Registration';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../pages/firebaseConfig.jsx';
import { toast } from 'sonner';
import Button from '../../components/ui/Button';
import { MailIcon, LockIcon ,LogOutIcon, EyeIcon, EyeOffIcon} from 'lucide-react';
import axios from 'axios';
import ReadsOwner from '../../components/owner/ReadsOwner';

const OwnerAuth: React.FC = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showReadsModal, setShowReadsModal] = useState(false);
  const [ownerUid, setOwnerUid] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const loadingToast = toast.loading('Connexion en cours...');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      setOwnerUid(uid); // stocke l'uid pour la modale
      const response = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/owners/getOwner/${uid}`);
      if (response.data && ((Array.isArray(response.data) && response.data.length > 0) || response.data.id === uid)) {
        // Vérifie si le propriétaire a lu le document légal
        const readRes = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/legales/readByReader/${uid}`);
        if (Array.isArray(readRes.data) && readRes.data.length === 0) {
          // Affiche la modale ReadsOwner
          setShowReadsModal(true);
          toast.dismiss(loadingToast);
          toast.info('Veuillez lire et accepter le document légal avant de continuer.', { id: loadingToast, duration: 9000 });
          return;
        } else {
          toast.dismiss(loadingToast);
          toast.success('Connexion réussie !', { id: loadingToast, duration: 8000 });
          navigate('/owner/dashboard');
        }
      } else {
        toast.dismiss(loadingToast);
        toast.error('Utilisateur introuvable', { id: loadingToast, duration: 20000 });
      }
    } catch (error) {
      const err = error as { code?: string; message?: string; response?: { data?: { error?: string } } };
      const authErrorCodes = [
        'auth/invalid-email',
        'auth/user-disabled',
        'auth/user-not-found',
        'auth/wrong-password',
        'auth/invalid-credential'
      ];
      console.error('Firebase error:', err);
      if (
        err.code && authErrorCodes.includes(err.code) ||
        (err.message && (
          err.message.includes('INVALID_PASSWORD') ||
          err.message.includes('wrong-password') ||
          err.message.includes('invalid-credential') ||
          err.message.includes('user-not-found') ||
          err.message.includes('invalid-email')
        ))
      ) {
        toast.dismiss(loadingToast);
        toast.error("Mot de passe ou nom d'utilisateur incorrect", { id: loadingToast, duration: 20000 });
      } else if (err.code === 'auth/too-many-requests') {
        toast.dismiss(loadingToast);
        toast.error("Trop de tentatives : accès temporairement bloqué. Réessayez plus tard.", { id: loadingToast, duration: 9000 });
      } else if (err.message && err.message.includes('ERR_NAME_NOT_RESOLVED')) {
        toast.dismiss(loadingToast);
        toast.error("Erreur réseau : impossible de contacter le service d'authentification. Vérifiez votre connexion internet.", { id: loadingToast, duration: 9000 });
      } else {
        toast.dismiss(loadingToast);
        toast.error(err.response?.data?.error || err.message || "Erreur de connexion", { id: loadingToast, duration: 9000 });
      }
    } finally {
      setIsLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  // Fonction appelée à la fermeture de la modale ReadsOwner
  const handleReadsModalClose = async () => {
    setShowReadsModal(false);
    if (ownerUid) {
      // Recheck si le document a été lu
      try {
        const readRes = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/legales/readByReader/${ownerUid}`);
        if (Array.isArray(readRes.data) && readRes.data.length > 0) {
          toast.success('Merci d\'avoir lu et accepté le document légal !', { duration: 6000 });
          navigate('/owner/dashboard');
        } else {
          toast.error('Vous devez lire et accepter le document légal pour accéder à votre espace.');
        }
      } catch (err) {
        toast.error('Erreur lors de la vérification du document légal.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-black p-6">
      {/* Modale ReadsOwner */}
      {showReadsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
            <ReadsOwner onClose={handleReadsModalClose} userId={ownerUid} />
          </div>
        </div>
      )}
      <div className="max-w-md mx-auto space-y-8">
        {/* Bouton retour aligné à droite */}
        <div className="flex items-center justify-end mb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-400 hover:text-[#3EFEFE] focus:outline-none"
            aria-label="Retour"
          >
            <LogOutIcon className="ml-2" size={20} />
          </button>
        </div>
        <div className="text-white">
          <h1 className="text-3xl font-bold">
            {isRegister ? 'Créer un compte propriétaire' : 'Connexion Propriétaire'}
          </h1>
          <p className="text-gray-400 mt-2">
            {isRegister
              ? 'Commencez à louer vos véhicules sur DriveGab '
              : 'Accédez à votre espace propriétaire DriveGab '}
          </p>
        </div>
        {isRegister ? (
          <>
            <OwnerRegistration onSwitchToLogin={() => setIsRegister(false)} />
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Email */}
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-900 text-white rounded-lg pl-10 pr-4 py-3 border border-gray-800 focus:border-[#3EFEFE] focus:outline-none"
                  required
                />
              </div>
              
              {/* Mot de passe */}
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-900 text-white rounded-lg pl-10 pr-12 py-3 border border-gray-800 focus:border-[#3EFEFE] focus:outline-none"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#3EFEFE] focus:outline-none"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <a 
                href="/owner/forgot-password" 
                className="text-[#3EFEFE] text-sm hover:underline"
              >
                Mot de passe oublié ?
              </a>
            </div>
            
            <Button
              fullWidth
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
            
            <div className="text-center text-gray-400">
              <p>
                Pas encore de compte ?{' '}
                <button
                  type="button"
                  className="text-[#3EFEFE] hover:underline"
                  onClick={() => setIsRegister(true)}
                >
                  S'inscrire
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OwnerAuth;
