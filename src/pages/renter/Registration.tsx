import React, { useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, MailIcon, PhoneIcon, FileIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import Button from '../../components/ui/Button';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../pages/firebaseConfig';
import axios from 'axios';
import { toast } from 'sonner';
import cloudinaryConfig from '../../services/cloudinaryConfig';

interface RenterRegistrationProps {
  onSwitchToLogin?: () => void;
}

const RenterRegistration: React.FC<RenterRegistrationProps> = ({ onSwitchToLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [documents, setDocuments] = useState({
    cni: null as File | null,
    permis: null as File | null
  });
  const [documentUrls, setDocumentUrls] = useState({
    cni: '',
    permis: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    cni: 0,
    permis: 0
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (file: File, type: 'cni' | 'permis') => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('folder', 'armada_auto/renters');

    try {
      setIsUploading(true);
      setUploadProgress(prev => ({ ...prev, [type]: 0 }));

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setUploadProgress(prev => ({ ...prev, [type]: percentCompleted }));
          },
        }
      );

      setDocumentUrls(prev => ({ ...prev, [type]: response.data.secure_url }));
      toast.success(`Document ${type === 'cni' ? 'CNI' : 'Permis'} uploadé avec succès`);
      console.log(`✅ Upload réussi pour ${type}:`, response.data.secure_url);
    } catch (error) {
      toast.error(`Erreur lors de l'upload du document ${type === 'cni' ? 'CNI' : 'Permis'}`);
      console.error(`❌ Upload error for ${type}:`, error);
    } finally {
      setUploadProgress(prev => ({ ...prev, [type]: 0 }));
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'cni' | 'permis') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocuments(prev => ({ ...prev, [type]: file }));
      handleFileUpload(file, type);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      console.error('❌ Les mots de passe ne correspondent pas');
      return;
    }

    if (!documentUrls.cni || !documentUrls.permis) {
      toast.error('Veuillez uploader tous les documents requis');
      console.error('❌ Documents manquants');
      return;
    }

    try {
      // 1. Création du compte Firebase
      toast.loading('Création du compte...');
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      const uid = userCredential.user.uid;
      console.log('✅ Compte Firebase créé, UID:', uid);

      // 2. Enregistrement dans MySQL
      const renterData = {
        id: uid, // Utilisation de l'UID Firebase comme IDx   
        fullname: formData.fullname,
        email: formData.email,
        phone: formData.phone,
        cni: documentUrls.cni,
        permis: documentUrls.permis
      };
      console.log('📤 Envoi des données locataire à MySQL:', renterData);

      await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/renters/renter/add', renterData);
      console.log('✅ Données locataire enregistrées dans MySQL:', renterData);

      // 3. Notification à l'admin
      try {
        await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/notifications/addNotification', {
          userId: 'admin',
          type: 'creation_compte',
          title: 'Nouveau compte locataire',
          message: `Un nouveau locataire a créé un compte: ${formData.fullname} (${formData.email})`,
          link: `/admin/renters/${uid}`,
          meta: {
            renterId: uid,
            fullname: formData.fullname,
            email: formData.email,
            phone: formData.phone
          }
        });
        console.log('[LOG] Notification admin création compte envoyée');
      } catch (notifErr) {
        console.error('[Notification] Erreur lors de la notification admin création compte:', notifErr);
      }

      toast.success('Compte créé avec succès !', { duration: 5000 });
      navigate('/renter/dashboard');
    } catch (error: any) {
      let errorMessage = "Erreur lors de l'inscription";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Cet email est déjà utilisé";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Le mot de passe doit faire au moins 6 caractères";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(errorMessage);
      console.error('❌ Erreur inscription:', error);
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
                name="fullname"
                placeholder="Nom complet" 
                value={formData.fullname}
                onChange={handleInputChange}
                className="w-full bg-gray-900 text-white rounded-lg pl-10 pr-4 py-3 border border-gray-800 focus:border-[#3EFEFE] focus:outline-none" 
                required 
              />
            </div>

            {/* Email */}
            <div className="relative">
              <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="email" 
                name="email"
                placeholder="Email" 
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-gray-900 text-white rounded-lg pl-10 pr-4 py-3 border border-gray-800 focus:border-[#3EFEFE] focus:outline-none" 
                required 
              />
            </div>

            {/* Téléphone */}
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="tel" 
                name="phone"
                placeholder="Numéro de téléphone" 
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full bg-gray-900 text-white rounded-lg pl-10 pr-4 py-3 border border-gray-800 focus:border-[#3EFEFE] focus:outline-none" 
                required 
              />
            </div>

            {/* Mot de passe */}
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Mot de passe" 
                value={formData.password}
                onChange={handleInputChange}
                className="w-full bg-gray-900 text-white rounded-lg pl-4 pr-12 py-3 border border-gray-800 focus:border-[#3EFEFE] focus:outline-none" 
                required
                minLength={6}
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

            {/* Confirmation mot de passe */}
            <div className="relative">
              <input 
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirmer le mot de passe" 
                value={formData.confirmPassword}
                onChange={handleInputChange}
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

            {/* Documents */}
            <div>
              <label className="block text-gray-400 mb-2">
                Documents requis
                <span className="text-[#3EFEFE]">*</span>
              </label>
              <div className="space-y-3">
                {/* CNI */}
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center">
                  <FileIcon className="mx-auto text-gray-400 mb-2" size={24} />
                  <p className="text-gray-400">CNI ou Passeport</p>
                  {documentUrls.cni ? (
                    <>
                      {documentUrls.cni.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                        <img
                          src={documentUrls.cni}
                          alt="CNI"
                          className="mx-auto my-2 max-h-32 rounded shadow"
                        />
                      ) : (
                        <a
                          href={documentUrls.cni}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#3EFEFE] text-sm underline"
                        >
                          Voir le document
                        </a>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-gray-500 text-xs mt-1">
                        {uploadProgress.cni > 0 ? `Upload: ${uploadProgress.cni}%` : 'Cliquez pour uploader'}
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, 'cni')}
                        disabled={isUploading}
                        id="cni-upload"
                      />
                      <label
                        htmlFor="cni-upload"
                        className="cursor-pointer inline-block mt-2 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm"
                      >
                        Sélectionner un fichier
                      </label>
                    </>
                  )}
                </div>

                {/* Permis */}
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center">
                  <FileIcon className="mx-auto text-gray-400 mb-2" size={24} />
                  <p className="text-gray-400">Permis de conduire</p>
                  {documentUrls.permis ? (
                    <>
                      {documentUrls.permis.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                        <img
                          src={documentUrls.permis}
                          alt="Permis"
                          className="mx-auto my-2 max-h-32 rounded shadow"
                        />
                      ) : (
                        <a
                          href={documentUrls.permis}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#3EFEFE] text-sm underline"
                        >
                          Voir le document
                        </a>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-gray-500 text-xs mt-1">
                        {uploadProgress.permis > 0 ? `Upload: ${uploadProgress.permis}%` : 'Cliquez pour uploader'}
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, 'permis')}
                        disabled={isUploading}
                        id="permis-upload"
                      />
                      <label
                        htmlFor="permis-upload"
                        className="cursor-pointer inline-block mt-2 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm"
                      >
                        Sélectionner un fichier
                      </label>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            fullWidth
            className="py-2 px-3 text-sm md:py-3 md:px-6 md:text-base"
            disabled={isUploading || !documentUrls.cni || !documentUrls.permis}
          >
            {isUploading ? 'Traitement...' : 'Créer mon compte'}
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

export default RenterRegistration;