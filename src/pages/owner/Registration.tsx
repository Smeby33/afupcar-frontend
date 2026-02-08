import React, { useState, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { UserIcon, MailIcon, PhoneIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../pages/firebaseConfig';
import cloudinaryConfig from '../../services/cloudinaryConfig';
import axios from 'axios';
import { toast } from 'sonner';

interface OwnerRegistrationProps {
  onSwitchToLogin?: () => void;
}

const OwnerRegistration: React.FC<OwnerRegistrationProps> = ({ onSwitchToLogin }) => {
  const navigate = useNavigate();
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [documentCni, setDocumentCni] = useState<File | null>(null);
  const [documentCniUrl, setDocumentCniUrl] = useState<string>('');
  const [isUploading, setIsLoadingUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Upload sur Cloudinary dès sélection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocumentCni(file);
      setUploadError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', cloudinaryConfig.uploadPreset);
      formData.append('folder', 'armada_auto');

      try {
        setIsLoadingUploading(true);
        toast.loading('Téléchargement du document en cours...');
        console.log('📤 Début du téléchargement du document sur Cloudinary...');
        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/auto/upload`,
          formData
        );
        setDocumentCniUrl(response.data.secure_url);
        toast.success('Document téléchargé avec succès !');
        console.log('✅ Document téléchargé avec succès sur Cloudinary :', response.data);
      } catch (err: any) {
        setUploadError('Erreur lors du téléchargement du document.');
        setDocumentCniUrl('');
        toast.error('Erreur lors du téléchargement du document.');
        console.error('❌ Erreur lors du téléchargement du document :', err);
      } finally {
        setIsLoadingUploading(false);
        toast.dismiss();
        console.log('⏹️ Fin du téléchargement du document');
      }
    }
  };

  const handleButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    console.log('🟢 handleButtonClick déclenché');
    handleSubmit(e as any);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🟢 handleSubmit appelé');

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!documentCniUrl) {
      toast.error("Veuillez ajouter et uploader une pièce d'identité.");
      return;
    }

    try {
      toast.loading('Création du compte...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      console.log('✅ Utilisateur Firebase créé, UID:', uid);

      // Envoi au backend avec l'URL Cloudinary
      const response = await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/owners/addOwner', {
        id: uid,
        fullname,
        email,
        phone,
        documentcni: documentCniUrl,
      });
      console.log('✅ Données envoyées au backend', response.data);

      // Notification à l'admin
      try {
        await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/notifications/addNotification', {
          userId: 'admin',
          type: 'creation_compte_owner',
          title: 'Nouveau compte propriétaire',
          message: `Un nouveau propriétaire a créé un compte: ${fullname} (${email})`,
          link: `/admin/owners/${uid}`,
          meta: {
            ownerId: uid,
            fullname,
            email,
            phone
          }
        });
        console.log('[LOG] Notification admin création compte propriétaire envoyée');
      } catch (notifErr) {
        console.error('[Notification] Erreur lors de la notification admin création compte propriétaire:', notifErr);
      }

      toast.success('Compte créé avec succès !');
      // Redirection seulement après le toast de succès
      setTimeout(() => {
        navigate('/owner/dashboard');
      }, 5000); // Laisse le toast s'afficher 1 seconde avant de rediriger
    } catch (error: any) {
      toast.error("Erreur d'inscription : " + (error.response?.data?.error || error.message));
      console.error('❌ Erreur lors de l\'inscription :', error);
    } finally {
      toast.dismiss();
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
            {/* Email */}
            <div className="relative">
              <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
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
            {/* Mot de passe */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mot de passe"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-gray-900 text-white rounded-lg pl-4 pr-12 py-3 border border-gray-800 focus:border-[#3EFEFE] focus:outline-none"
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
            {/* Confirmation */}
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-900 text-white rounded-lg pl-4 pr-12 py-3 border border-gray-800 focus:border-[#3EFEFE] focus:outline-none"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#3EFEFE] focus:outline-none"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
              </button>
            </div>
            {/* Pièce d'identité */}
            <div>
              <label className="block text-gray-400 mb-2">
                Pièce d'identité <span className="text-[#3EFEFE]">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center">
                <p className="text-gray-400">Cliquez pour télécharger votre CNI ou Passeport</p>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  required
                  disabled={isUploading}
                />
                {isUploading && <div className="text-yellow-400 mt-2">Chargement...</div>}
                {uploadError && <div className="text-red-500 mt-2">{uploadError}</div>}
                {/* Aperçu du document */}
                {documentCniUrl && (
                  <div className="mt-4">
                    {documentCni && documentCni.type.startsWith('image/') ? (
                      <img
                        src={documentCniUrl}
                        alt="Aperçu pièce d'identité"
                        className="mx-auto max-h-40 rounded shadow"
                      />
                    ) : (
                      <a
                        href={documentCniUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 underline"
                      >
                        Voir le document : {documentCni?.name}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <Button
            fullWidth
            type="submit"
            disabled={isUploading || !documentCniUrl}
          >
            Créer mon compte
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

export default OwnerRegistration;
