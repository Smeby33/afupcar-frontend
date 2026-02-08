import React, { useState, ChangeEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CarIcon, ImageIcon, InfoIcon, CurrencyIcon, MapPinIcon, SunIcon, SmartphoneIcon, SnowflakeIcon, BluetoothIcon, FuelIcon } from 'lucide-react';
import Button from '../../components/ui/Button';
import axios from 'axios';
import { toast } from 'sonner';
import cloudinaryConfig from '../../services/cloudinaryConfig';
import { getAuth } from "firebase/auth";
import Select, { components as selectComponents } from 'react-select';

interface CarFeatures {
  sunroof: boolean;
  androidauto: boolean;
  clime: boolean;
  bluetooth: boolean;
  comission: boolean;
}

const AddVehicle: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});

  // Marques et modèles dynamiques
  const [marques, setMarques] = useState<{ id: string, nom: string }[]>([]);
  const [modeles, setModeles] = useState<{ id: string, modele: string }[]>([]);

  // Données du véhicule
  const [carData, setCarData] = useState({
    marque: '',
    modele: '',
    type: '',
    description: '',
    ville: '',
    prix: '',
    prixhorszone: '',
    avance: false, // booléen
    fuel: '',      // fuel ici
    boiteVitesse: '', // Ajout du champ boîte de vitesse
  });

  // Features
  const [features, setFeatures] = useState<CarFeatures>({
    sunroof: false,
    androidauto: false,
    clime: false,
    bluetooth: false,
    comission: false, // comission ici
  });

  // Photos (ajout de photoenter)
  const [photos, setPhotos] = useState<{
    front: File | null;
    back: File | null;
    left: File | null;
    right: File | null;
    enter: File | null; // nouvelle photo
  }>({
    front: null,
    back: null,
    left: null,
    right: null,
    enter: null,
  });

  const [photoUrls, setPhotoUrls] = useState<{
    front: string;
    back: string;
    left: string;
    right: string;
    enter: string; // nouvelle url
  }>({
    front: '',
    back: '',
    left: '',
    right: '',
    enter: '',
  });

  // Ajout states pour react-select
  const [selectedMarque, setSelectedMarque] = useState<{ value: string, label: string } | null>(null);
  const [selectedModele, setSelectedModele] = useState<{ value: string, label: string } | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setCarData(prev => ({ ...prev, [name]: target.checked }));
    } else {
      setCarData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFeatureToggle = (feature: keyof CarFeatures) => {
    setFeatures(prev => ({ ...prev, [feature]: !prev[feature] }));
  };

  const handlePhotoUpload = async (file: File, position: keyof typeof photos) => {
    if (!file) return;
    console.log(`Début upload pour ${position}`, file);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('folder', 'armada_auto/vehicles');

    try {
      setIsLoading(true);
      setUploadProgress(prev => ({ ...prev, [position]: 0 }));

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setUploadProgress(prev => ({ ...prev, [position]: percentCompleted }));
            console.log(`Upload ${position}: ${percentCompleted}%`);
          },
        }
      );

      setPhotoUrls(prev => ({ ...prev, [position]: response.data.secure_url }));
      console.log(`Upload réussi pour ${position}:`, response.data.secure_url);
      toast.success(`Photo ${position} uploadée avec succès`);
    } catch (error) {
      toast.error(`Erreur lors de l'upload de la photo ${position}`);
      console.error(`Upload error for ${position}:`, error);
    } finally {
      setUploadProgress(prev => ({ ...prev, [position]: 0 }));
      setIsLoading(false);
    }
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>, position: keyof typeof photos) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotos(prev => ({ ...prev, [position]: file }));
      handlePhotoUpload(file, position);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Vérification des champs obligatoires
    if (!carData.marque || !carData.modele || !carData.ville || !carData.prix) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      setIsLoading(false);
      console.log('Champs manquants:', carData);
      return;
    }

    // Vérification des photos
    if (!photoUrls.front || !photoUrls.back || !photoUrls.left || !photoUrls.right || !photoUrls.enter) {
      toast.error('Veuillez uploader les 5 photos du véhicule (4 extérieures + 1 intérieur)');
      setIsLoading(false);
      console.log('Photos manquantes:', photoUrls);
      return;
    }

    try {
      toast.loading('Ajout du véhicule en cours...');
      const auth = getAuth();
      const user = auth.currentUser;
      const ownerId = user ? user.uid : null;
      if (!ownerId) {
        toast.error("Utilisateur non connecté !");
        setIsLoading(false);
        console.log('Utilisateur non connecté');
        return;
      }

      console.log('Données envoyées à l\'API :', {
        ...carData,
        ...features,
        photofront: photoUrls.front,
        photoback: photoUrls.back,
        photoleft: photoUrls.left,
        photorigth: photoUrls.right,
        photoenter: photoUrls.enter, // nouvelle photo
        proprio: ownerId,
        prix: parseFloat(carData.prix),
        prixhorszone: carData.prixhorszone ? parseInt(carData.prixhorszone) : null,
        avance: carData.avance,
        fuel: carData.fuel,
        comission: features.comission,
      });

      const response = await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/addCar', {
        ...carData,
        ...features,
        photofront: photoUrls.front,
        photoback: photoUrls.back,
        photoleft: photoUrls.left,
        photorigth: photoUrls.right,
        photoenter: photoUrls.enter, // nouvelle photo
        proprio: ownerId,
        prix: parseFloat(carData.prix),
        prixhorszone: carData.prixhorszone ? parseInt(carData.prixhorszone) : null,
        avance: carData.avance,
        fuel: carData.fuel,
        comission: features.comission,
      });

      console.log('Réponse API:', response.data);

      // Notification à l'admin
      try {
        await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/notifications/addNotification', {
          userId: 'admin',
          type: 'ajout_vehicule',
          title: 'Ajout de véhicule',
          message: `Un nouveau véhicule ${carData.marque} ${carData.modele} a été ajouté par le propriétaire (${ownerId}).`,
          link: `/admin/cars/${response.data.id || ''}`,
          meta: {
            carId: response.data.id || '',
            proprio: ownerId,
            marque: carData.marque,
            modele: carData.modele
          }
        });
        console.log('[LOG] Notification admin ajout véhicule envoyée');
      } catch (notifErr) {
        console.error('[Notification] Erreur lors de la notification admin ajout véhicule:', notifErr);
      }

      toast.success('Véhicule ajouté avec succès !');
      navigate('/owner/dashboard');
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout du véhicule:', error);
      toast.error(error.response?.data?.error || "Erreur lors de l'ajout du véhicule");
    } finally {
      setIsLoading(false);
      toast.dismiss();
    }
  };

  // Récupérer toutes les marques au chargement
  useEffect(() => {
    axios.get('https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/allMarques')
      .then(res => setMarques(res.data))
      .catch(() => setMarques([]));
  }, []);

  // Récupérer les modèles quand une marque est sélectionnée
  useEffect(() => {
    if (selectedMarque) {
      console.log('Marque sélectionnée:', selectedMarque);  
      axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/models/byMarque/${selectedMarque.value}`)
        .then(res => setModeles(res.data))
        .catch(() => setModeles([]));
      setSelectedModele(null); // reset modèle si marque change
      setCarData(prev => ({ ...prev, marque: selectedMarque.value, modele: '' }));
    } else {
      setModeles([]);
      setCarData(prev => ({ ...prev, marque: '', modele: '' }));
    }
  }, [selectedMarque]);

  // Mettre à jour carData.modele quand selectedModele change
  useEffect(() => {
    setCarData(prev => ({ ...prev, modele: selectedModele ? selectedModele.value : '' }));
  }, [selectedModele]);

  // Pour react-select
  const marqueOptions = marques.map(m => ({ value: m.nom, label: m.nom }));
  const modeleOptions = modeles.map(m => ({ value: m.modele, label: m.modele }));

  // Ajustement du style pour que l'icône ne soit pas masquée par react-select
  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: '#111827',
      color: '#fff',
      borderRadius: '0.5rem',
      borderColor: state.isFocused ? '#3EFEFE' : '#1f2937',
      boxShadow: state.isFocused ? '0 0 0 2px #3EFEFE' : undefined,
      minHeight: '48px',
      fontSize: '1rem',
      position: 'relative',
      zIndex: 1,
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      paddingLeft: 0, // évite un double padding
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: '#fff',
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: '#111827',
      color: '#fff',
      borderRadius: '0.5rem',
      zIndex: 20,
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#3EFEFE'
        : state.isFocused
        ? '#23272e'
        : '#111827',
      color: state.isSelected ? '#111827' : '#fff',
      fontWeight: state.isSelected ? 700 : 400,
      cursor: 'pointer',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#9ca3af', // text-gray-400
    }),
    input: (provided: any) => ({
      ...provided,
      color: '#fff',
    }),
  };

  // Composant custom pour injecter l'icône dans le champ react-select
  const CarControl = (props: any) => (
    <selectComponents.Control {...props}>
      <CarIcon className="ml-2 text-gray-400 mr-1" size={20} />
      {props.children}
    </selectComponents.Control>
  );

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-white">
          <h1 className="text-3xl font-bold">Ajouter un véhicule</h1>
          <p className="text-gray-400 mt-2">
            Remplissez les informations de votre véhicule
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <CarIcon className="absolute  top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                <Select
                  options={marqueOptions}
                  value={selectedMarque}
                  onChange={setSelectedMarque}
                  placeholder={marques.length === 0 ? 'Aucune marque disponible' : 'Sélectionner une marque*'}
                  isClearable
                  isLoading={marques.length === 0}
                  noOptionsMessage={() => 'Aucune marque trouvée'}
                  classNamePrefix="react-select"
                  styles={customSelectStyles}
                  components={{ Control: CarControl }}
                />
              </div>
              <div className="relative">
                <CarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                <Select
                  options={modeleOptions}
                  value={selectedModele}
                  onChange={setSelectedModele}
                  placeholder={selectedMarque ? (modeles.length === 0 ? 'Aucun modèle disponible' : 'Sélectionner un modèle*') : 'Sélectionner une marque d’abord'}
                  isClearable
                  isDisabled={!selectedMarque}
                  isLoading={selectedMarque && modeles.length === 0}
                  noOptionsMessage={() => selectedMarque ? 'Aucun modèle trouvé' : 'Sélectionnez une marque'}
                  classNamePrefix="react-select"
                  styles={customSelectStyles}
                  components={{ Control: CarControl }}
                />
              </div>
            </div>

            {/* Type, carburant, ville, boîte de vitesse */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <CarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <select
                  name="type"
                  value={carData.type}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 text-white rounded-lg pl-10 pr-4 py-3 border border-gray-800 focus:border-[#3EFEFE] focus:outline-none appearance-none"
                >
                  <option value="">Sélectionner un type*</option>
                  <option value="berline">Berline</option>
                  <option value="suv">SUV</option>
                  <option value="pickup">Pick-up</option>
                  <option value="minibus">CrossOver</option>
                  <option value="minibus">Minibus</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div className="relative">
                <CarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <select
                  name="boiteVitesse"
                  value={carData.boiteVitesse}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 text-white rounded-lg pl-10 pr-4 py-3 border border-gray-800 focus:border-[#3EFEFE] focus:outline-none appearance-none"
                  required
                >
                  <option value="">Sélectionner la boîte de vitesse*</option>
                  <option value="Auto">Automatique</option>
                  <option value="Manuel">Manuelle</option>
                </select>
              </div>
              
              <div className="relative">
                <FuelIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <select
                  name="fuel"
                  value={carData.fuel}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 text-white rounded-lg pl-10 pr-4 py-3 border border-gray-800 focus:border-[#3EFEFE] focus:outline-none appearance-none"
                  required
                >
                  <option value="">Sélectionner un carburant*</option>
                  <option value="Essence">Essence</option>
                  <option value="Gazole">Gazole</option>
                </select>
              </div>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <select
                  name="ville"
                  value={carData.ville}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 text-white rounded-lg pl-10 pr-4 py-3 border border-gray-800 focus:border-[#3EFEFE] focus:outline-none appearance-none"
                  required
                >
                  <option value="">Sélectionner une ville*</option>
                  <option value="Port-gentil">Port-gentil</option>
                  <option value="Libreville">Libreville</option>
                  <option value="Bitam">Bitam</option>
                  <option value="Libreville2">Libreville2</option>
                  <option value="Mouanda">Mouanda</option>
                </select> 
              </div>
              
            </div>

            {/* Description */}
            <div className="relative">
              <InfoIcon className="absolute left-3 top-3 text-gray-400" size={20} />
              <textarea
                name="description"
                placeholder="Description du véhicule"
                rows={4}
                value={carData.description}
                onChange={handleInputChange}
                className="w-full bg-gray-900 text-white rounded-lg pl-10 pr-4 py-3 border border-gray-800 focus:border-[#3EFEFE] focus:outline-none"
              />
            </div>

            {/* Prix et avance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <CurrencyIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="number"
                  name="prix"
                  placeholder="Prix par jour (FCFA)*"
                  value={carData.prix}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 text-white rounded-lg pl-10 pr-4 py-3 border border-gray-800 focus:border-[#3EFEFE] focus:outline-none"
                  required
                />
              </div>
              <div className="relative">
                <CurrencyIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="number"
                  name="prixhorszone"
                  placeholder="Prix hors zone (FCFA)"
                  value={carData.prixhorszone}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 text-white rounded-lg pl-10 pr-4 py-3 border border-gray-800 focus:border-[#3EFEFE] focus:outline-none"
                />
              </div>
              
              {/* <div className="flex items-center gap-4 bg-gray-900 rounded-lg p-3 border border-gray-800">
                <input
                  type="checkbox"
                  id="avance"
                  name="avance"
                  checked={carData.avance}
                  onChange={handleInputChange}
                  className="h-5 w-5 rounded border-gray-300 text-[#3EFEFE] focus:ring-[#3EFEFE]"
                />
                <label htmlFor="avance" className="text-white">
                  Paiement d'avance requis (45%)
                </label>
              </div>
              <div className="flex items-center gap-4 bg-gray-900 rounded-lg p-3 border border-gray-800">
                <input
                  type="checkbox"
                  id="comission"
                  name="comission"
                  checked={features.comission}
                  onChange={() => setFeatures(prev => ({ ...prev, comission: !prev.comission }))}
                  className="h-5 w-5 rounded border-gray-300 text-[#3EFEFE] focus:ring-[#3EFEFE]"
                />
                <label htmlFor="comission" className="text-white">
                  Commission réservation (obligatoire)
                </label>
              </div> */}
            </div>

            {/* Options */}
            <div className="space-y-3">
              <h3 className="text-white font-medium">Options du véhicule</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => handleFeatureToggle('sunroof')}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border ${features.sunroof ? 'border-[#3EFEFE] bg-[#3EFEFE]/10' : 'border-gray-700'}`}
                >
                  <SunIcon size={18} className={features.sunroof ? 'text-[#3EFEFE]' : 'text-gray-400'} />
                  <span className={features.sunroof ? 'text-[#3EFEFE]' : 'text-gray-400'}>Toit ouvrant</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleFeatureToggle('androidauto')}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border ${features.androidauto ? 'border-[#3EFEFE] bg-[#3EFEFE]/10' : 'border-gray-700'}`}
                >
                  <SmartphoneIcon size={18} className={features.androidauto ? 'text-[#3EFEFE]' : 'text-gray-400'} />
                  <span className={features.androidauto ? 'text-[#3EFEFE]' : 'text-gray-400'}>Android Auto</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleFeatureToggle('clime')}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border ${features.clime ? 'border-[#3EFEFE] bg-[#3EFEFE]/10' : 'border-gray-700'}`}
                >
                  <SnowflakeIcon size={18} className={features.clime ? 'text-[#3EFEFE]' : 'text-gray-400'} />
                  <span className={features.clime ? 'text-[#3EFEFE]' : 'text-gray-400'}>Climatisation</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleFeatureToggle('bluetooth')}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border ${features.bluetooth ? 'border-[#3EFEFE] bg-[#3EFEFE]/10' : 'border-gray-700'}`}
                >
                  <BluetoothIcon size={18} className={features.bluetooth ? 'text-[#3EFEFE]' : 'text-gray-400'} />
                  <span className={features.bluetooth ? 'text-[#3EFEFE]' : 'text-gray-400'}>Bluetooth</span>
                </button>
              </div>
            </div>

            {/* Photos */}
            <div className="space-y-4">
              <h3 className="text-white font-medium">Photos du véhicule <span className="text-red-500">*</span></h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Photo avant */}
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center">
                  <label className="cursor-pointer">
                    <ImageIcon className="mx-auto text-gray-400 mb-2" size={24} />
                    <p className="text-gray-400 text-sm">Avant</p>
                    {photoUrls.front ? (
                      <img 
                        src={photoUrls.front} 
                        alt="Avant" 
                        className="mt-2 mx-auto max-h-24 rounded"
                      />
                    ) : (
                      <p className="text-gray-500 text-xs mt-1">
                        {uploadProgress.front ? `Upload: ${uploadProgress.front}%` : 'Cliquez pour uploader'}
                      </p>
                    )}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => handlePhotoChange(e, 'front')}
                    />
                  </label>
                </div>
                
                {/* Photo arrière */}
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center">
                  <label className="cursor-pointer">
                    <ImageIcon className="mx-auto text-gray-400 mb-2" size={24} />
                    <p className="text-gray-400 text-sm">Arrière</p>
                    {photoUrls.back ? (
                      <img 
                        src={photoUrls.back} 
                        alt="Arrière" 
                        className="mt-2 mx-auto max-h-24 rounded"
                      />
                    ) : (
                      <p className="text-gray-500 text-xs mt-1">
                        {uploadProgress.back ? `Upload: ${uploadProgress.back}%` : 'Cliquez pour uploader'}
                      </p>
                    )}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => handlePhotoChange(e, 'back')}
                    />
                  </label>
                </div>
                
                {/* Photo côté gauche */}
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center">
                  <label className="cursor-pointer">
                    <ImageIcon className="mx-auto text-gray-400 mb-2" size={24} />
                    <p className="text-gray-400 text-sm">Côté gauche</p>
                    {photoUrls.left ? (
                      <img 
                        src={photoUrls.left} 
                        alt="Côté gauche" 
                        className="mt-2 mx-auto max-h-24 rounded"
                      />
                    ) : (
                      <p className="text-gray-500 text-xs mt-1">
                        {uploadProgress.left ? `Upload: ${uploadProgress.left}%` : 'Cliquez pour uploader'}
                      </p>
                    )}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => handlePhotoChange(e, 'left')}
                    />
                  </label>
                </div>
                
                {/* Photo côté droit */}
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center">
                  <label className="cursor-pointer">
                    <ImageIcon className="mx-auto text-gray-400 mb-2" size={24} />
                    <p className="text-gray-400 text-sm">Côté droit</p>
                    {photoUrls.right ? (
                      <img 
                        src={photoUrls.right} 
                        alt="Côté droit" 
                        className="mt-2 mx-auto max-h-24 rounded"
                      />
                    ) : (
                      <p className="text-gray-500 text-xs mt-1">
                        {uploadProgress.right ? `Upload: ${uploadProgress.right}%` : 'Cliquez pour uploader'}
                      </p>
                    )}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => handlePhotoChange(e, 'right')}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Upload photo intérieur */}
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center">
                  <label className="cursor-pointer">
                    <ImageIcon className="mx-auto text-gray-400 mb-2" size={24} />
                    <p className="text-gray-400 text-sm">Photo intérieur</p>
                    {photoUrls.enter ? (
                      <img src={photoUrls.enter} alt="Photo intérieur" className="mt-2 mx-auto max-h-24 rounded" />
                    ) : (
                      <p className="text-gray-500 text-xs mt-1">
                        {uploadProgress.enter ? `Upload: ${uploadProgress.enter}%` : 'Cliquez pour uploader'}
                      </p>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={e => handlePhotoChange(e, 'enter')}
                    />
                  </label>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-4">
            <Button 
              variant="secondary" 
              onClick={() => {
                console.log('Annulation, retour dashboard');
                navigate('/owner/dashboard');
              }} 
              className="flex-1 py-1 px-1 h-30 text-sm"
              disabled={isLoading}
              style={{ backgroundColor: '#1f2937', color: '#fff', height: '40px' }}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              className="flex-1 py-1 px-1 h-30 text-sm"
              disabled={
                isLoading ||
                !photoUrls.front ||
                !photoUrls.back ||
                !photoUrls.left ||
                !photoUrls.right||
                !photoUrls.enter 
              }
              style={{ backgroundColor: isLoading ? '#ccc' : '#4caf50', color: '#fff', height: '40px' }}
            >
              {isLoading ? 'Enregistrement...' : 'Ajouter le véhicule'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicle;