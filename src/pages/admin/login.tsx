import React, { useState } from 'react';
import AdminRegistration from './Registration';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../pages/firebaseConfig';
import axios from 'axios';
import { toast } from 'sonner';
import { MailIcon, LockIcon ,LogOutIcon} from 'lucide-react';

const AdminAuth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading('Connexion en cours...');
    try {
      // Authentification Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      toast.success('Authentification Firebase réussie !', { duration: 1200 });
      // Récupération des infos admin depuis le backend
      const response = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/admins/getOneAdmin/${uid}`);
      const admin = response.data;
      if (admin && ((Array.isArray(admin) && admin.length > 0) || admin.id === uid)) {
        toast.dismiss(loadingToast);
        toast.success(`Bienvenue ${admin.fullname || admin.full_name || 'Admin'} !`, { duration: 8000 });
        toast.info('Redirection vers le dashboard...', { duration: 2000 });
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 2000);
      } else {
        toast.dismiss(loadingToast);
        toast.error('Utilisateur introuvable', { duration: 12000 });
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
      console.error('Erreur Firebase:', err);
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
        toast.error("Mot de passe ou nom d'utilisateur incorrect", { duration: 9000 });
      } else if (err.code === 'auth/too-many-requests') {
        toast.dismiss(loadingToast);
        toast.error("Trop de tentatives : accès temporairement bloqué. Réessayez plus tard.", { duration: 9000 });
      } else if (err.message && err.message.includes('ERR_NAME_NOT_RESOLVED')) {
        toast.dismiss(loadingToast);
        toast.error("Erreur réseau : impossible de contacter le service d'authentification. Vérifiez votre connexion internet.", { duration: 9000 });
      } else {
        toast.dismiss(loadingToast);
        toast.error(err.response?.data?.error || err.message || "Erreur de connexion", { duration: 9000 });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      
      <div className="max-w-md min-h-screen mx-auto space-y-8">
         {/* Bouton retour aligné à droite */}
        <div className="flex items-center justify-end mt-4 mb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-400 hover:text-[#3EFEFE] focus:outline-none"
            aria-label="Retour"
          >
            <LogOutIcon className="ml-2" size={20} />
          </button>
        </div>
        <div className="text-white text-center">
          <h1 className="text-3xl font-bold">
            {isRegister ? 'Créer un compte admin' : 'Connexion Admin'}
          </h1>
          <p className="text-gray-400 mt-2">
            {isRegister ? 'Créez un compte administrateur Lotu Auto' : 'Accédez à votre espace d\'administration'}
          </p>
        </div>
        {isRegister ? (
          <>
            <AdminRegistration onSwitchToLogin={() => setIsRegister(false)} />
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
                  className="w-full bg-gray-900 text-white rounded-lg pl-10 pr-4 py-3 border border-gray-800 focus:border-[#3EFEFE] focus:outline-none"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              {/* Mot de passe */}
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  placeholder="Mot de passe"
                  className="w-full bg-gray-900 text-white rounded-lg pl-10 pr-4 py-3 border border-gray-800 focus:border-[#3EFEFE] focus:outline-none"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-[#3EFEFE] text-black font-bold py-3 rounded-lg hover:bg-[#b6e62e] transition"
              disabled={loading}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
            <div className="text-center text-gray-400">
              <p>
                Pas encore de compte ?{' '}
                <button
                  type="button"
                  className="text-[#3EFEFE] hover:underline"
                  onClick={() => setIsRegister(true)}
                >
                  Créer un compte admin
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminAuth;