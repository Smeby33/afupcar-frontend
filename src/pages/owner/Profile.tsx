import React, { useState, useEffect } from 'react';
import { BuildingIcon, UserIcon, SettingsIcon, BarChart3Icon, CarIcon, BellIcon,LogOutIcon } from 'lucide-react';
import logoBlanc from '../../../logo-noir.png';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../pages/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'sonner';
import PersonalInfoForm from './PersonalInfoForm';
import CompanyInfoForm from './CompanyInfoPanel';
import Loader from '../../components/ui/Loader';
import ReadsOwner from '../../components/owner/ReadsOwner';

interface Rule {
  age: number;
  livraison: number; // <-- devient un nombre
  idproprio: string;
  fumer: boolean;
  animaux: boolean;
}

const ProfileOwner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'personal' | 'company' | 'rules'>('personal');
  const [owner, setOwner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState<any>({
    fullname: '',
    email: '',
    phone: '',
    documentcni: '',
    companyname: '',
    numeronif: '',
    adresse: '',
    latitude: '',
    longitude: '',
    picture: ''
  });
  const [rules, setRules] = useState<Rule | null>(null);
  const [showLivraison, setShowLivraison] = useState(rules?.livraison > 0);
  const [cguDoc, setCguDoc] = useState<string | null>(null);
  const [privacyDoc, setPrivacyDoc] = useState<string | null>(null);
  const [showReadsModal, setShowReadsModal] = useState(false);
  const navigate = useNavigate();

  // Initialisation du formulaire avec toutes les données
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          setLoading(true);
          // Chargement des infos du propriétaire
          const ownerRes = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/owners/getOwner/${user.uid}`);
          setOwner(ownerRes.data);
          setForm({
            fullname: ownerRes.data.fullname || '',
            email: ownerRes.data.email || '',
            phone: ownerRes.data.phone || '',
            documentcni: ownerRes.data.documentcni || '',
            companyname: ownerRes.data.companyname || '',
            numeronif: ownerRes.data.numeronif || '',
            adresse: ownerRes.data.adresse || '',
            latitude: ownerRes.data.latitude || '',
            longitude: ownerRes.data.longitude || '', 
            picture: ownerRes.data.picture || ''
          });

          // Chargement des règles
          const rulesRes = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/regles/regle/${user.uid}`);
          setRules(rulesRes.data);

          // Chargement des documents légaux
          const cguRes = await axios.get('https://qxmaqyf9jt.us-east-1.awsapprunner.com/legales/byTitre/CGU proprietaire');
          setCguDoc(cguRes.data?.contenu || null);
          console.log('CGU Document:', cguRes.data);
          const privacyRes = await axios.get('https://qxmaqyf9jt.us-east-1.awsapprunner.com/legales/byTitre/Politique proprietaire');
          setPrivacyDoc(privacyRes.data?.contenu || null);
          console.log('Politique Document:', privacyRes.data);
        } catch (err) {
          // Si aucune règle n'existe encore, on initialise un objet vide
          if (axios.isAxiosError(err) && err.response?.status === 404) {
            setRules({ age: 21, livraison: 0, idproprio: user.uid, fumer: false, animaux: false });
          } else {
            toast.error("Impossible de charger le profil.");
          }
        } finally {
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Gestion des changements de formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Gestion des changements de règles
  const handleRuleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setRules(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : name === 'livraison'
          ? Number(value)
          : value
    }));
  };

  // Soumission de la mise à jour
  const handleUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);

      // Mise à jour des infos du propriétaire
      await axios.put(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/owners/updateOwner/${owner.id}`, form);

      // Préparation des règles à envoyer
      let rulesToSend = rules;
      // Si la livraison n'est pas proposée, on force la valeur à 0
      if (!showLivraison && rulesToSend) {
        rulesToSend = { ...rulesToSend, livraison: 0 };
      }

      // Mise à jour ou création des règles
      if (rulesToSend) {
        await axios.put(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/regles/regle/update/${owner.id}`, rulesToSend);
      }

      // Notification à l'admin
      try {
        await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/notifications/addNotification', {
          userId: 'admin',
          type: 'modification_profil_owner',
          title: 'Modification de profil propriétaire',
          message: `Le propriétaire ${form.fullname} (${form.email}) a modifié son profil.`,
          link: `/admin/owners/${owner.id}`,
          meta: {
            ownerId: owner.id,
            fullname: form.fullname,
            email: form.email,
            phone: form.phone
          }
        });
        console.log('[LOG] Notification admin modification profil propriétaire envoyée');
      } catch (notifErr) {
        console.error('[Notification] Erreur lors de la notification admin modification profil propriétaire:', notifErr);
      }

      toast.success("Profil et règles mis à jour !");
      setOwner({ ...form, id: owner.id });
      setEdit(false);
    } catch (err) {
      toast.error("Erreur lors de la mise à jour.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Suppression des règles
  const handleDeleteRules = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer vos règles ?")) {
      try {
        await axios.delete(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/regles/delete/regle/${owner.id}`);
          setRules({ age: 21, livraison: 0, idproprio: owner.id, fumer: false, animaux: false });
        toast.success("Règles supprimées avec succès !");
      } catch (err) {
        toast.error("Erreur lors de la suppression des règles.");
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'armada_auto');

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dubsfeixa/auto/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setForm((prev: any) => ({
        ...prev,
        documentcni: data.secure_url,
      }));
      toast.success('Document uploadé avec succès !');
    } catch (err) {
      toast.error('Erreur lors de l\'upload du document.');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'armada_auto');

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dubsfeixa/auto/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setForm((prev: any) => ({
        ...prev,
        picture: data.secure_url,
      }));
      toast.success('Logo uploadé avec succès !');
    } catch (err) {
      toast.error('Erreur lors de l\'upload du logo.');
    }
  };

  const handleGetPosition = () => {
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev: any) => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
        }));
        toast.success('Position récupérée !');
      },
      () => {
        toast.error('Impossible de récupérer la position.');
      }
    );
  };

  if (loading) return <Loader />;

  if (loading || !form) return <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>;

  return (
    <div className="p-4 bg-gray-100 rounded-xl shadow-md max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-8">
         <div className="bg-gray-50 text-white p-4 flex items-end justify-between shadow-md fixed top-0 left-0 right-0 z-50">
          {/* <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-800"
              title="Retour"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left">
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
            </button>
            <img src={logoNoir} alt="Logo" className="h-10" />
            <h1 className="text-xl font-bold">Mon Profil </h1>
          </div> */}
          <button
            onClick={async () => {
              await auth.signOut();
              navigate('/register');
            }}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
            title="Déconnexion"
          >
            <LogOutIcon size={18} />
  
          </button>
           <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center  gap-2 px-4 py-2 rounded-lg ${
            activeTab === 'rules' ? 'bg-black text-[#3EFEFE]' : 'bg-gray-100 text-gray-700'
          }`}
        >
          <SettingsIcon size={18} />
          
        </button>
        </div>

       
      </div>
      
      <div className="flex mt-24 gap-4 mb-6">
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            activeTab === 'personal' ? 'bg-black text-[#3EFEFE]' : 'bg-gray-100 text-gray-700'
          }`}
        >
          <UserIcon size={18} />
          Infos personnelles
        </button>
        <button
          onClick={() => setActiveTab('company')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            activeTab === 'company' ? 'bg-black text-[#3EFEFE]' : 'bg-gray-100 text-gray-700'
          }`}
        >
          <BuildingIcon size={18} />
          Infos entreprise
        </button>
        
      </div>

      <div className="mt-6">
        {activeTab === 'personal' && form && (
          <PersonalInfoForm
            form={form}
            edit={edit}
            handleChange={handleChange}
            handleFileUpload={handleFileUpload}
          />
        )}

        {activeTab === 'company' && (
          <CompanyInfoForm
            form={form}
            edit={edit}
            handleChange={handleChange}
            handleLogoUpload={handleLogoUpload}
            handleGetPosition={handleGetPosition}
          />
        )}

        {activeTab === 'rules' && rules && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Règles de location</h2>
            <div>
              <label className="block text-gray-600">Âge minimum requis*</label>
              <input
                type="number"
                name="age"
                className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                value={rules.age}
                onChange={handleRuleChange}
                readOnly={!edit}
                min="18"
                max="99"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showLivraison"
                className="mr-2"
                checked={showLivraison}
                onChange={() => setShowLivraison(v => !v)}
                disabled={!edit}
              />
              <label htmlFor="showLivraison" className="text-gray-600">
                Proposez-vous la livraison du véhicule ?
              </label>
            </div>
            {showLivraison && (
              <div className="mt-4">
                <label className="block text-gray-600 mb-1">Prix de la livraison</label>
                <select
                  name="livraison"
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                  value={rules.livraison}
                  onChange={handleRuleChange}
                  disabled={!edit}
                >
                  <option value={0}>Gratuit</option>
                  <option value={1000}>1000 XAF</option>
                  <option value={2000}>2000 XAF</option>
                  <option value={3000}>3000 XAF</option>
                </select>
              </div>
            )}
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                name="fumer"
                id="fumer"
                className="mr-2"
                checked={rules.fumer}
                onChange={handleRuleChange}
                disabled={!edit}
              />
              <label htmlFor="fumer" className="text-gray-600">
                Fumer autorisé dans le véhicule
              </label>
            </div>
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                name="animaux"
                id="animaux"
                className="mr-2"
                checked={rules.animaux}
                onChange={handleRuleChange}
                disabled={!edit}
              />
              <label htmlFor="animaux" className="text-gray-600">
                Animaux acceptés dans le véhicule
              </label>
            </div>
            
            {edit && (
              <button
                onClick={handleDeleteRules}
                className="mt-4 text-red-600 text-sm"
              >
                Supprimer ces règles
              </button>
            )}

             {/* Affichage des documents légaux */}
        {cguDoc && (
          <div className="bg-white rounded-lg shadow p-6 mb-">
            <h2 className="text-xl font-bold text-[#3EFEFE] mb-2">CGU Propriétaire</h2>
            <div className="text-gray-800 text-sm whitespace-pre-line">{cguDoc}</div>
          </div>
        )}
        {privacyDoc && (
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <h2 className="text-xl font-bold text-[#3EFEFE] mb-2">Politique Propriétaire</h2>
            <div className="text-gray-800 text-sm whitespace-pre-line">{privacyDoc}</div>
          </div>
        )}
          </div>
        )}

       

        {/* Boutons de contrôle */}
        <div className="mt-6 flex gap-4">
          {!edit ? (
            <button
              onClick={() => setEdit(true)}
              className="bg-gray-200 text-sm px-4 py-2 rounded-lg"
            >
              {activeTab === 'personal' ? 'Modifier infos personnelles' : 
               activeTab === 'company' ? 'Modifier infos entreprise' : 'Modifier règles'}
            </button>
          ) : (
            <>
              <button
                onClick={handleUpdate}
                className="bg-[#3EFEFE] text-black px-4 py-2 rounded-lg font-bold"
              >
                Enregistrer
              </button>
              <button
                onClick={() => setEdit(false)}
                className="bg-gray-200 px-4 py-2 rounded-lg"
              >
                Annuler
              </button>
            </>
          )}
        </div>
      </div>
        {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-[#222]" style={{ borderRadius: '40px 40px 40px 40px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',margin: '0 2px 15px 2px',borderBlockColor: '#222' }}>
        <div className="flex justify-around p-3">
          <button className="flex flex-col items-center gap-1 text-gray-400"
            onClick={() => navigate('/owner/dashboard')}>
            <BarChart3Icon size={18} />
            <span className="text-xs">Dashboard</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400"
            onClick={() => navigate('/owner/vehicle/OwnerVehicles')}>
            <CarIcon size={18} />
            <span className="text-xs">Véhicules</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400"
            onClick={() => navigate('/owner/notifications')}>
            <BellIcon size={18} />
            <span className="text-xs">Notifications</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 text-[#3EFEFE]"
            onClick={() => navigate('/owner/profile')}
          >
            <UserIcon size={18} />
            <span className="text-xs">Profil</span>
          </button>
        </div>
      </nav>

      {/* Ajout d'un bouton pour ouvrir la modale des légales */}
      <div className="flex justify-start mt-4 mb-4">
        <button
          onClick={() => setShowReadsModal(true)}
          className="bg-[#3EFEFE] text-black px-4 py-2 rounded-lg  text-sm shadow hover:bg-[#eaff8b] transition"
        >
          Voir les documents légaux
        </button>
      </div>

      {/* Modale ReadsOwner */}
      {showReadsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full relative">
            <ReadsOwner onClose={() => setShowReadsModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileOwner;