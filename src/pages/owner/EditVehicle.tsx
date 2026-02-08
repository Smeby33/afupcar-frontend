import React, { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { CarIcon, ImageIcon, InfoIcon, CurrencyIcon, MapPinIcon, SunIcon, SmartphoneIcon, SnowflakeIcon, BluetoothIcon } from 'lucide-react';
import Button from '../../components/ui/Button';
import axios from 'axios';
import { toast } from 'sonner';
import cloudinaryConfig from '../../services/cloudinaryConfig';
import { getAuth } from "firebase/auth";

interface CarFeatures {
  sunroof: boolean;
  androidauto: boolean;
  clime: boolean;
  bluetooth: boolean;
  comission: boolean;
}

const EditVehicle: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const vehicle = location.state?.vehicle;
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [carData, setCarData] = useState({
    marque: '',
    modele: '',
    type: '',
    description: '',
    ville: '',
    prix: '',
    prixhorszone: '',
    avance: false,
    fuel: '',
    boiteVitesse: '', // Ajouté
  });
  const [features, setFeatures] = useState<CarFeatures>({
    sunroof: false,
    androidauto: false,
    clime: false,
    bluetooth: false,
    comission: false, // Ajouté ici
  });
  const [photos, setPhotos] = useState<{
    front: File | null;
    back: File | null;
    left: File | null;
    rigth: File | null;
    enter: File | null; // Ajouté
  }>({
    front: null,
    back: null,
    left: null,
    rigth: null,
    enter: null,
  });
  const [photoUrls, setPhotoUrls] = useState<{
    front: string;
    back: string;
    left: string;
    rigth: string;
    enter: string; // Ajouté
  }>({
    front: 'https://res.cloudinary.com/dubsfeixa/image/upload/v1747684625/armada_auto/vehicles/xxxxxx.jpg',
    back: '',
    left: '',
    rigth: '',
    enter: '',
  });

  // Charger les infos du véhicule à modifier
  useEffect(() => {
    const fetchVehicle = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/car/${id}`);
        const data = response.data;
        console.log('Données modifier du véhicule:', data);
        setCarData({
          marque: data.marque || '',
          modele: data.modele || '',
          type: data.type || '',
          description: data.description || '',
          ville: data.ville || '',
          prix: data.prix ? data.prix.toString() : '',
          prixhorszone: data.prixhorszone ? data.prixhorszone.toString() : '',
          avance: !!data.avance,
          fuel: data.fuel || '',
          boiteVitesse: data.boiteVitesse || '', // Ajouté
        });
        setFeatures({
          sunroof: !!data.sunroof,
          androidauto: !!data.androidauto,
          clime: !!data.clime,
          bluetooth: !!data.bluetooth,
          comission: !!data.comission, // Ajouté ici
        });
        setPhotoUrls({
          front: data.photofront || '',
          back: data.photoback || '',
          left: data.photoleft || '',
          rigth: data.photorigth || '',
          enter: data.photoenter || '', // Ajouté
        });
      } catch (error) {
        toast.error("Erreur lors du chargement du véhicule");
      } finally {
        setIsLoading(false);
      }
    };
    fetchVehicle();
  }, [id]);

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
          },
        }
      );
      // Ajoute ce log pour voir le lien renvoyé par Cloudinary
      console.log(`Lien Cloudinary pour ${position}:`, response.data.secure_url);

      setPhotoUrls(prev => ({ ...prev, [position]: response.data.secure_url }));
      toast.success(`Photo ${position} uploadée avec succès`);
    } catch (error) {
      toast.error(`Erreur lors de l'upload de la photo ${position}`);
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

    if (!carData.marque || !carData.modele || !carData.ville || !carData.prix) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      setIsLoading(false);
      return;
    }
    if (!photoUrls.front || !photoUrls.back || !photoUrls.left || !photoUrls.rigth || !photoUrls.enter) {
      toast.error('Veuillez uploader les 5 photos du véhicule (4 extérieures + 1 intérieur)');
      setIsLoading(false);
      return;
    }

    try {
      toast.loading('Modification du véhicule en cours...');
      const auth = getAuth();
      const user = auth.currentUser;
      const ownerId = user ? user.uid : null;
      if (!ownerId) {
        toast.error("Utilisateur non connecté !");
        setIsLoading(false);
        return;
      }

      const dataToSend = {
        ...carData,
        ...features,
        photofront: photoUrls.front,
        photoback: photoUrls.back,
        photoleft: photoUrls.left,
        photorigth: photoUrls.rigth,
        photoenter: photoUrls.enter, // Ajouté
        proprio: ownerId,
        prix: parseFloat(carData.prix),
        prixhorszone: carData.prixhorszone ? parseInt(carData.prixhorszone) : null,
        avance: carData.avance,
        fuel: carData.fuel,
        boiteVitesse: carData.boiteVitesse, // Ajouté
        comission: features.comission,
      };

      console.log('Données envoyées à la modification :', dataToSend);
      console.log('photoUrls:', photoUrls);

      await axios.put(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/car/${id}`, dataToSend);

      // Notification à l'admin
      try {
        await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/notifications/addNotification', {
          userId: 'admin',
          type: 'modification_vehicule',
          title: 'Modification de véhicule',
          message: `Le véhicule ${carData.marque} ${carData.modele} a été modifié par le propriétaire (${ownerId}).`,
          link: `/admin/cars/${id}`,
          meta: {
            carId: id,
            proprio: ownerId,
            marque: carData.marque,
            modele: carData.modele
          }
        });
        console.log('[LOG] Notification admin modification véhicule envoyée');
      } catch (notifErr) {
        console.error('[Notification] Erreur lors de la notification admin modification véhicule:', notifErr);
      }

      toast.dismiss();
      toast.success('✅ Véhicule modifié avec succès !');
      setTimeout(() => navigate('/owner/dashboard'), 1200);
    } catch (error: any) {
      toast.dismiss();
      console.error('Erreur lors de la modification du véhicule :', error);
      if (error.response) {
        console.error('Réponse serveur :', error.response.data);
      }
      toast.error(error.response?.data?.error || "❌ Erreur lors de la modification du véhicule");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-white">
          <h1 className="text-3xl font-bold">Modifier le véhicule</h1>
          <p className="text-gray-400 mt-2">
            Modifiez les informations de votre véhicule
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    {/* Informations de base */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <CarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <select
                          name="marque"
                          value={carData.marque}
                          onChange={handleInputChange}
                          className="w-full bg-gray-900 text-white rounded-lg pl-10 pr-4 py-3 border border-gray-800 focus:border-[#3EFEFE] focus:outline-none appearance-none"
                          required
                        >
                          <option value="">Sélectionner une marque*</option>
                          <option value="Toyota">Toyota</option>
                          <option value="Honda">Honda</option>
                          <option value="Ford">Ford</option>
                          <option value="Nissan">Nissan</option>
                          <option value="Hyundai">Hyundai</option>
                          <option value="Kia">Kia</option>
                          <option value="Mercedes">Mercedes</option>
                          <option value="BMW">BMW</option>
                          <option value="Audi">Audi</option>
                          <option value="Mazda">Mazda</option>
                          <option value="Subaru">Subaru</option>
                          <option value="Lexus">Lexus</option>
                          <option value="Land Rover">Land Rover</option>
                        </select>  
                      </div>
                      
                      <div className="relative">
                        <CarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          name="modele"
                          placeholder="Modèle*"
                          value={carData.modele}
                          onChange={handleInputChange}
                          className="w-full bg-gray-900 text-white rounded-lg pl-10 pr-4 py-3 border border-gray-800 focus:border-[#3EFEFE] focus:outline-none"
                          required
                        />
                      </div>
                    </div>
        
                    {/* Type et ville */}
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
                        <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <select
                          name="ville"
                          value={carData.ville}
                          onChange={handleInputChange}
                          className="w-full bg-gray-900 text-white rounded-lg pl-10 pr-4 py-3 border border-gray-800 focus:border-[#3EFEFE] focus:outline-none appearance-none"
                          required
                        >
                          <option value="">Sélectionner une ville*</option>
                          <option value="Abidjan">Port-gentil</option>
                          <option value="Bouaké">Libreville</option>
                          <option value="Korhogo">Bitam</option>
                          <option value="San Pedro">Libreville2</option>
                          <option value="Yamoussoukro">Mouanda</option>
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
                      
                      <div className="flex items-center gap-4 bg-gray-900 rounded-lg p-3 border border-gray-800">
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
                    </div>

                     {/* Commission */}
                    <div className="flex items-center gap-4 bg-gray-900 rounded-lg p-3 border border-gray-800">
                      <input
                        type="checkbox"
                        id="comission"
                        name="comission"
                        checked={features.comission}
                        onChange={() => setFeatures(prev => ({ ...prev, comission: !prev.comission }))
                        }
                        className="h-5 w-5 rounded border-gray-300 text-[#3EFEFE] focus:ring-[#3EFEFE]"
                      />
                      <label htmlFor="comission" className="text-white">
                        Caution Lotu (45%)
                      </label>
                    </div>
        
                    {/* Carburant */}
                    <div className="relative">
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
        
                    {/* Boîte de vitesse */}
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
                            {photoUrls.rigth ? (
                              <img 
                                src={photoUrls.rigth} 
                                alt="Côté droit" 
                                className="mt-2 mx-auto max-h-24 rounded"
                              />
                            ) : (
                              <p className="text-gray-500 text-xs mt-1">
                                {uploadProgress.rigth ? `Upload: ${uploadProgress.rigth}%` : 'Cliquez pour uploader'}
                              </p>
                            )}
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => handlePhotoChange(e, 'rigth')}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Photo intérieur */}
                      <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center min-w-[220px] mt-4">
                        <label className="cursor-pointer">
                          <ImageIcon className="mx-auto text-[#3EFEFE] mb-2" size={24} />
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
                  </div>
        
                  {/* Boutons */}
                  <div className="flex gap-4">
                    <Button 
                      variant="secondary" 
                      onClick={() => {
                        console.log('Annulation, retour dashboard');
                        navigate('/owner/dashboard');
                      }} 
                      className="flex-1 py-2 px-2 text-sm"
                      disabled={isLoading}
                    >
                      Annuler
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 py-2 px-2 text-sm"
                      disabled={
                        isLoading ||
                        !photoUrls.front ||
                        !photoUrls.back ||
                        !photoUrls.left ||
                        !photoUrls.rigth
                      }
                    >
                      {isLoading ? 'Enregistrement...' : 'Modifier le véhicule'}
                    </Button>
                  </div>
                </form>
      </div>
    </div>
  );
};

export default EditVehicle;