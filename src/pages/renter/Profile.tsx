import React, { useState, useEffect } from 'react';
import { UserIcon, CreditCardIcon, HistoryIcon, SettingsIcon, HeartIcon, LogOutIcon,LayoutDashboardIcon,ClockIcon,CarIcon } from 'lucide-react';
import logoNoir from '../../../logo-blanc.png';
import axios from 'axios';
import { auth } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';
import PaymentMethods from '../../components/renter/PaymentMethods';
import ReadsRenter from '../../components/renter/ReadsRenter';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/ui/Loader';

interface RenterData {
  id: string;
  fullname: string;
  email: string;
  phone: string;
  cni: string;
  permis: string;
  photo:string;

}

const ProfileRenter: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'payment' | 'history' | 'favorites'>('profile');
  const [renter, setRenter] = useState<RenterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    fullname: '',
    email: '',
    phone: '',
    cni: '',
    permis: '',
    photo: ''
  });
  const [reservations, setReservations] = useState<any[]>([]);
  const [cars, setCars] = useState<{ [key: string]: any }>({});
  const [favorites, setFavorites] = useState<any[]>([]);
  const [showReadsModal, setShowReadsModal] = useState(false);

  // Chargement des données
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          setLoading(true);
          const response = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/renters/getRenter/${user.uid}`);
          setRenter(response.data);
          setForm({
            fullname: response.data.fullname || '',
            email: response.data.email || user.email || '',
            phone: response.data.phone || '',
            cni: response.data.cni || '',
            permis: response.data.permis || '',
            photo: response.data.photo || ''
          });
        } catch (err) {
          toast.error("Erreur lors du chargement du profil");
        } finally {
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        const conducteur = user ? user.uid : null;
        if (!conducteur) return;
        const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/reservations/conducteur/${conducteur}`);
        setReservations(res.data);

        // Charger les infos voitures associées
        const carIds = Array.from(new Set(res.data.map((r: any) => r.voiture)));
        const carsData: { [key: string]: any } = {};
        await Promise.all(
          carIds.map(async (carId) => {
            try {
              const carRes = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/car/${carId}`);
              carsData[carId] = carRes.data;
            } catch (e) {
              carsData[carId] = null;
            }
          })
        );
        setCars(carsData);
      } catch (err) {
        setReservations([]);
      }
    };
    fetchReservations();
  }, []);

  // Récupération des favoris du client
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        const conducteur = user ? user.uid : null;
        if (!conducteur) return;
        const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/favoris/favoris/chauffeur/${conducteur}`);
        // Récupère toutes les voitures en une seule fois
        const carsRes = await axios.get('https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/allCars');
        const allCars = carsRes.data;
        // Mappe les infos voiture sur chaque favori
        const favoritesWithCarInfo = res.data.map((fav: any) => {
          const car = allCars.find((c: any) => c.id === fav.voiture);
          return {
            ...fav,
            voiture_marque: car?.marque || '',
            voiture_modele: car?.modele || '',
            voiture_photo: car?.photofront || '',
            voiture_prix: car?.prix || '',
            voiture_ville: car?.ville || '',
          };
        });
        setFavorites(favoritesWithCarInfo);
        console.log("Favoris enrichis :", favoritesWithCarInfo);
      } catch (err) {
        setFavorites([]);
      }
    };
    fetchFavorites();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      console.log("Données envoyées à la route de modification :", form);
      await axios.put(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/renters/modifier/renter/${renter?.id}`, form);
      toast.success("Profil mis à jour !");
      setEdit(false);
      setRenter({ ...renter, ...form } as RenterData);

      // Notification à l'admin
      try {
        await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/notifications/addNotification', {
          userId: 'admin',
          type: 'modification_profil',
          title: 'Modification de profil',
          message: `Le locataire ${form.fullname} (${form.email}) a modifié son profil.`,
          link: `/admin/renters/${renter?.id}`,
          meta: {
            renterId: renter?.id,
            fullname: form.fullname,
            email: form.email,
            phone: form.phone
          }
        });
        console.log('[LOG] Notification admin modification profil envoyée');
      } catch (notifErr) {
        console.error('[Notification] Erreur lors de la notification admin modification profil:', notifErr);
      }
    } catch (err) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'cni' | 'photo' | 'permis') => {
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
      setForm(prev => ({ ...prev, [field]: data.secure_url }));
      toast.success('Fichier uploadé avec succès !');
    } catch (err) {
      toast.error('Erreur lors de l\'upload');
    }
  };

  const getReservationStatus = (statut: number, dateDebut: string, dateFin: string) => {
    const today = new Date();
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);

    if (statut === 1 && today >= debut && today <= fin) return 'consommation';
    if (statut === 1 && fin < today) return 'completed';
    if (statut === 0 && fin < today) return 'cancelled';
    if (statut === 1) return 'confirmed';
    return 'pending';
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen w-full bg-gray-50 ">
       {/* Header */}
        <div className="bg-gray-50 text-white p-4 flex items-end justify-end shadow-md fixed top-0 left-0 right-0 z-50">
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
        </div>
      <div className="min-h-screen w-full mt-20 bg-gray-50 p-4">
        <div className="max-w-3xl mb-20 mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        

          {/* Navigation tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-3 flex items-center justify-center gap-2 ${
                activeTab === 'profile' ? 'text-[#3EFEFE] bg-black' : 'text-gray-600'
              }`}
            >
              <UserIcon size={18} />
              <span className="hidden sm:inline">Profil</span>
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`flex-1 py-3 flex items-center justify-center gap-2 ${
                activeTab === 'payment' ? 'text-[#3EFEFE] bg-black' : 'text-gray-600'
              }`}
            >
              <CreditCardIcon size={18} />
              <span className="hidden sm:inline">Paiement</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 flex items-center justify-center gap-2 ${
                activeTab === 'history' ? 'text-[#3EFEFE] bg-black' : 'text-gray-600'
              }`}
            >
              <HistoryIcon size={18} />
              <span className="hidden sm:inline">Historique</span>
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex-1 py-3 flex items-center justify-center gap-2 ${
                activeTab === 'favorites' ? 'text-[#3EFEFE] bg-black' : 'text-gray-600'
              }`}
            >
              <HeartIcon size={18} />
              <span className="hidden sm:inline">Favoris</span>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4 bg-gray-200">
                    {form.photo ? (
                      <img src={form.photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <UserIcon size={32} />
                      </div>
                    )}
                    {edit && (
                      <label className="absolute bottom-0 right-0 bg-black text-white p-1 rounded-full cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'photo')}
                          accept="image/*"
                        />
                        <SettingsIcon size={16} />
                      </label>
                    )}
                  </div>
                  {edit && <p className="text-sm text-gray-500 mb-4">Cliquez sur l'icône pour changer la photo</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-600 mb-1">Nom complet</label>
                    <input
                      type="text"
                      name="fullname"
                      value={form.fullname}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      readOnly={!edit}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full p-2 border rounded bg-gray-100"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      readOnly={!edit}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">CNI/Passeport</label>
                    {form.cni ? (
                      <a
                        href={form.cni}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline inline-block"
                      >
                        {form.cni.endsWith('.pdf') ? (
                          <span className="inline-block my-2">Voir le document PDF</span>
                        ) : (
                          <img
                            src={form.cni}
                            alt="Document CNI/Passeport"
                            className="max-h-32 rounded border my-2"
                          />
                        )}
                        Voir le document
                      </a>
                    ) : (
                      <p className="text-gray-400">Aucun document</p>
                    )}
                    {edit && (
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload(e, 'cni')}
                        accept="image/*,.pdf"
                        className="mt-2"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Permis de conduire</label>
                    {form.permis ? (
                      <a
                        href={form.permis}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline inline-block"
                      >
                        <img
                          src={form.permis}
                          alt="Permis de conduire"
                          className="max-h-32 rounded border my-2"
                        />
                        Voir le permis
                      </a>
                    ) : (
                      <p className="text-gray-400">Aucun permis</p>
                    )}
                    {edit && (
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload(e, 'permis')}
                        accept="image/*,.pdf"
                        className="mt-2"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="p-0">
              <PaymentMethods />
              </div>
              )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Historique des locations</h2>
                {reservations
                  .filter(r => getReservationStatus(r.statut, r.date_debut, r.date_fin) === 'completed')
                  .sort((a, b) => new Date(b.date_fin).getTime() - new Date(a.date_fin).getTime())
                  .length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Aucune location terminée</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reservations
                      .filter(r => getReservationStatus(r.statut, r.date_debut, r.date_fin) === 'completed')
                      .sort((a, b) => new Date(b.date_fin).getTime() - new Date(a.date_fin).getTime())
                      .map((r) => (
                        <div key={r.id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex items-center gap-4">
                            {cars[r.voiture]?.photo && (
                              <img src={cars[r.voiture].photo} alt="Voiture" className="w-24 h-16 object-cover rounded" />
                            )}
                            <div>
                              <div className="font-semibold">{cars[r.voiture]?.marque} {cars[r.voiture]?.modele}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(r.date_debut).toLocaleDateString()} au {new Date(r.date_fin).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-400">Réf: {r.id}</div>
                            </div>
                          </div>
                          <div>
                            <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                              Terminée
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="space-y-4">
              <h2 className="text-lg font-semibold">Mes voitures favorites</h2>
              {favorites.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Aucun véhicule favori</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {favorites.map((fav) => (
                    <div key={fav.id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {fav.voiture_photo && (
                          <img src={fav.voiture_photo} alt="Voiture" className="w-24 h-16 object-cover rounded" />
                        )}
                        <div>
                          <div className="font-semibold">{fav.voiture_marque} {fav.voiture_modele}</div>
                          <div className="text-xs text-gray-400">Réf: {fav.voiture}</div>
                        </div>
                      </div>
                      <div>
                        <span className="inline-block px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold">
                          Favori
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            )}

            {/* Actions */}
            {activeTab === 'profile' && (
              <div className="mt-8 flex justify-end gap-4">
                {!edit ? (
                  <button
                    onClick={() => setEdit(true)}
                    className="bg-[#3EFEFE] text-black px-6 py-2 rounded-lg font-medium"
                  >
                    Modifier le profil
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setEdit(false)}
                      className="bg-gray-200 px-6 py-2 rounded-lg"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleUpdate}
                      className="bg-black text-[#3EFEFE] px-6 py-2 rounded-lg font-medium"
                    >
                      Enregistrer
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          {/* Ajout d'un bouton pour ouvrir la modale des légales */}
      {activeTab === 'profile' && (
        <div className="flex justify-end mr-6 mb-4">
          <button
            onClick={() => setShowReadsModal(true)}
            className="bg-[#3EFEFE] text-black px-4 py-2 rounded-lg font-bold shadow hover:bg-[#eaff8b] transition"
          >
            Voir les documents légaux
          </button>
        </div>
      )}
        </div>
         
      </div>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-[#222]" style={{ borderRadius: '40px 40px 40px 40px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',margin: '0 2px 15px 2px',borderBlockColor: '#222' }}>
        <div className="flex justify-around p-3">
          <button  onClick={() => navigate('/renter/dashboard')} className="flex flex-col items-center gap-1 text-white hover:text-[#3EFEFE]">
            <LayoutDashboardIcon size={18} />
            <span className="text-xs font-semibold">Dashboard</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white hover:text-[#3EFEFE]"
            onClick={() => navigate('/renter/search')}>
            <CarIcon size={18} />
            <span className="text-xs">Recherche</span>
          </button>
          <button onClick={() => navigate('/renter/reservations')} className="flex flex-col items-center gap-1 text-white hover:text-[#3EFEFE]">
            <ClockIcon size={18} />
            <span className="text-xs">Réservations</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 text-[#3EFEFE]"
            onClick={() => navigate('/renter/profile')}
          >
            <UserIcon size={18} />
            <span className="text-xs">Profil</span>
          </button>
        </div>
      </nav>

     

      {/* Modale ReadsRenter */}
      {showReadsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full relative">
            <ReadsRenter onClose={() => setShowReadsModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileRenter;
