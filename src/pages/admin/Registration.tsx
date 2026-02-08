import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { UserIcon, PhoneIcon, LockIcon, ImageIcon } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import cloudinaryConfig from '../../services/cloudinaryConfig';
import axios from 'axios';
import { toast } from 'sonner';

interface AdminRegistrationProps {
  onSwitchToLogin?: () => void;
}

const AdminRegistration: React.FC<AdminRegistrationProps> = ({ onSwitchToLogin }) => {
  const navigate = useNavigate();
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Upload photo sur Cloudinary
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setUploadError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', cloudinaryConfig.uploadPreset);
      formData.append('folder', 'armada_admin');

      try {
        setIsUploading(true);
        toast.loading('Téléchargement de la photo...');
        console.log('[AdminRegistration] Début upload Cloudinary', file);
        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/auto/upload`,
          formData
        );
        setPhotoUrl(response.data.secure_url);
        toast.success('Photo téléchargée avec succès !');
        console.log('[AdminRegistration] Photo uploadée :', response.data.secure_url);
      } catch (err: any) {
        setUploadError('Erreur lors du téléchargement de la photo.');
        setPhotoUrl('');
        toast.error('Erreur lors du téléchargement de la photo.');
        console.error('[AdminRegistration] Erreur upload Cloudinary :', err);
      } finally {
        setIsUploading(false);
        toast.dismiss();
        console.log('[AdminRegistration] Fin upload Cloudinary');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[AdminRegistration] Submit déclenché');
    console.log('[AdminRegistration] Données:', { fullname, phone, email, password, confirmPassword, adminPassword, photoUrl });

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      console.warn('[AdminRegistration] Mots de passe différents');
      return;
    }
    if (!photoUrl) {
      toast.error("Veuillez ajouter et uploader une photo.");
      console.warn('[AdminRegistration] Pas de photo');
      return;
    }
    if (!adminPassword) {
      toast.error("Veuillez saisir le mot de passe admin.");
      console.warn('[AdminRegistration] Pas de mot de passe admin');
      return;
    }

    try {
      toast.loading('Création du compte admin...');
      console.log('[AdminRegistration] Création compte Firebase...');
      // Création du compte Firebase (pour login/email)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('[AdminRegistration] Utilisateur Firebase créé:', userCredential.user.uid);

      const firebaseId = userCredential.user.uid;
      console.log('[AdminRegistration] UID Firebase à envoyer :', firebaseId);

      // Envoi au backend
      console.log('[AdminRegistration] Envoi au backend :', {
        fullname,
        phone,
        photo: photoUrl,
        password: adminPassword,
      });
      const response = await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/admins/addAdmin', {
        id: firebaseId, // <-- AJOUTE CETTE LIGNE
        fullname,
        phone,
        photo: photoUrl,
        password: adminPassword,
      });
      console.log('[AdminRegistration] Réponse backend:', response.data);
      toast.success('Compte admin créé avec succès ! 🎉');
      navigate('/admin/dashboard');
    } catch (error: any) {
      toast.error("Erreur d'inscription : " + (error.response?.data?.message || error.message));
      console.error('[AdminRegistration] Erreur inscription :', error);
    } finally {
      toast.dismiss();
      console.log('[AdminRegistration] Fin du process inscription');
    }
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-md mx-auto space-y-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Nom complet */}
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Nom complet"
                value={fullname}
                onChange={e => setFullname(e.target.value)}
                className="w-full bg-gray-900 text-white rounded-lg pl-10 pr-4 py-3 border border-gray-800 focus:border-[#3EFEFE] focus:outline-none"
                required
              />
            </div>
            {/* Téléphone */}
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="tel"
                placeholder="Numéro de téléphone"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-gray-900 text-white rounded-lg pl-10 pr-4 py-3 border border-gray-800 focus:border-[#3EFEFE] focus:outline-none"
                required
              />
            </div>
            {/* Email */}
            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-gray-900 text-white rounded-lg pl-4 pr-4 py-3 border border-gray-800 focus:border-[#3EFEFE] focus:outline-none"
                required
              />
            </div>
            {/* Mot de passe */}
            <div className="relative">
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-gray-900 text-white rounded-lg pl-4 pr-4 py-3 border border-gray-800 focus:border-[#3EFEFE] focus:outline-none"
                required
              />
            </div>
            {/* Confirmation */}
            <div className="relative">
              <input
                type="password"
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-900 text-white rounded-lg pl-4 pr-4 py-3 border border-gray-800 focus:border-[#3EFEFE] focus:outline-none"
                required
              />
            </div>
            {/* Mot de passe admin */}
            <div className="relative">
              <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                placeholder="Mot de passe admin (exigé)"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                className="w-full bg-gray-900 text-white rounded-lg pl-10 pr-4 py-3 border border-gray-800 focus:border-[#3EFEFE] focus:outline-none"
                required
              />
            </div>
            {/* Photo */}
            <div>
              <label className="block text-gray-400 mb-2">
                Photo <span className="text-[#3EFEFE]">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center">
                <p className="text-gray-400">Cliquez pour télécharger votre photo</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  required
                  disabled={isUploading}
                />
                {isUploading && <div className="text-yellow-400 mt-2">Chargement...</div>}
                {uploadError && <div className="text-red-500 mt-2">{uploadError}</div>}
                {/* Aperçu de la photo */}
                {photoUrl && (
                  <div className="mt-4">
                    <img
                      src={photoUrl}
                      alt="Aperçu photo admin"
                      className="mx-auto max-h-40 rounded shadow"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <Button
            fullWidth
            type="submit"
            disabled={isUploading || !photoUrl}
          >
            Créer mon compte admin
          </Button>
          <div className="text-center text-gray-400">
            <p>
              Vous avez déjà un compte ?{' '}
              <button
                type="button"
                className="text-[#3EFEFE] hover:underline"
                onClick={onSwitchToLogin ? onSwitchToLogin : undefined}
              >
                Se connecter
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminRegistration;