import * as React from 'react';
import { useState } from 'react';
import RenterRegistration from './Registration';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../pages/firebaseConfig.jsx';
import { toast } from 'sonner';
import Button from '../../components/ui/Button';
import { MailIcon, LockIcon, LogOutIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import axios from 'axios';
import ReadsRenter from '../../components/renter/ReadsRenter';

const RenterAuth: React.FC = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showReadsModal, setShowReadsModal] = useState(false);
  const [renterUid, setRenterUid] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    setTimeout(() => toast('Test toast global'), 1000);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const loadingToast = toast.loading('Connexion en cours...');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      setRenterUid(uid);
      try {
        const response = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/renters/getRenter/${uid}`);
        if (Array.isArray(response.data) && response.data.length === 0) {
          toast.dismiss(loadingToast);
          toast.error('Utilisateur introuvable', { duration: 9000 });
        } else if (response.data && (response.data.id === uid || (Array.isArray(response.data) && response.data.length > 0))) {
          // Vérifie si le locataire a lu le document légal
          const readRes = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/legales/readByReader/${uid}`);
          if (Array.isArray(readRes.data) && readRes.data.length === 0) {
            setShowReadsModal(true);
            toast.dismiss(loadingToast);
            toast.info('Veuillez lire et accepter le document légal avant de continuer.', { id: loadingToast, duration: 9000 });
            return;
          } else {
            toast.dismiss(loadingToast);
            toast.success('Connexion réussie !', { id: loadingToast, duration: 8000 });
            navigate('/renter/dashboard');
          }
        } else {
          toast.dismiss(loadingToast);
          toast.error('Utilisateur introuvable', { duration: 9000 });
        }
      } catch (err: unknown) {
        const error = err as { response?: { status?: number; data?: { error?: string } }; message?: string };
        toast.dismiss(loadingToast);
        if (error.response && error.response.status === 404) {
          toast.error('Utilisateur introuvable', { duration: 9000 });
        } else {
          toast.error(error.response?.data?.error || error.message || 'Erreur lors de la vérification du compte.', { duration: 9000 });
        }
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
        setTimeout(() => toast.error("Mot de passe ou nom d'utilisateur incorrect", { duration: 9000 }), 100);
      } else {
        setTimeout(() => toast.error(err.response?.data?.error || err.message || "Erreur de connexion", { duration: 9000 }), 100);
      }
    } finally {
      setIsLoading(false);
      toast.dismiss();
    }
  };

  const handleReadsModalClose = async () => {
    setShowReadsModal(false);
    if (renterUid) {
      try {
        const readRes = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/legales/readByReader/${renterUid}`);
        if (Array.isArray(readRes.data) && readRes.data.length > 0) {
          toast.success('Merci d\'avoir lu et accepté le document légal !', { duration: 6000 });
          navigate('/renter/dashboard');
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
      {/* Modale ReadsRenter */}
      {showReadsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
            <ReadsRenter onClose={handleReadsModalClose} userId={renterUid} />
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
            {isRegister ? 'Créer un compte locataire' : 'Connexion Locataire'}
          </h1>
          <p className="text-gray-400 mt-2">
            {isRegister
              ? 'Commencez à louer des véhicules sur Lotu Auto'
              : 'Accédez à votre espace locataire Lotu Auto'}
          </p>
        </div>
        {isRegister ? (
          <>
            <RenterRegistration onSwitchToLogin={() => setIsRegister(false)} />
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

export default RenterAuth;
