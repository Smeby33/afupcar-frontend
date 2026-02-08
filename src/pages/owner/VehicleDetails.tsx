import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarIcon, EditIcon, TrashIcon, CheckCircleIcon,FuelIcon, XCircleIcon, CarIcon, ImageIcon, InfoIcon, CurrencyIcon, MapPinIcon, SunIcon, SmartphoneIcon, SnowflakeIcon, BluetoothIcon, BellIcon, BarChart3Icon, PlusCircleIcon, UserIcon, LogOutIcon, SettingsIcon } from 'lucide-react';
import Button from '../../components/ui/Button';
import Calendar from '../../components/owner/Calendar';
import axios from 'axios';
import { toast } from 'sonner';

interface Vehicle {
  id: string;
  marque: string;
  modele: string;
  type: string;
  description: string;
  boiteVitesse: string;
  ville: string;
  sunroof: boolean;
  androidauto: boolean;
  clime: boolean;
  bluetooth: boolean;
  photofront: string;
  photoback: string;
  photoleft: string;
  photorigth: string;
  prix: number;
  prixhorszone?: number | null;
  avance: boolean;
  proprio: string;
  statut: string;
  fuel?: string;
  comission?: boolean;
}

const VehicleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedVehicle, setEditedVehicle] = useState<Partial<Vehicle>>({});
  const [showCalendar, setShowCalendar] = useState(false);
  const [lastReservation, setLastReservation] = useState<any | null>(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/car/${id}`);
        setVehicle(response.data);
        console.log('Vehicle data:', response.data);
        setEditedVehicle(response.data);
      } catch (error) {
        console.error('Error fetching vehicle:', error);
        toast.error('Erreur lors du chargement du véhicule');
        navigate('/owner/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicle();
  }, [id, navigate]);

  useEffect(() => {
    if (!id) return;
    axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/last/${id}`)
      .then(res => setLastReservation(res.data))
      .catch(() => setLastReservation(null));
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setEditedVehicle(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUpdateVehicle = async () => {
    try {
      const payload: any = { ...editedVehicle };
      if (payload.prix !== undefined) payload.prix = payload.prix === '' || payload.prix === null ? null : Number(payload.prix);
      if (payload.prixhorszone !== undefined) payload.prixhorszone = payload.prixhorszone === '' || payload.prixhorszone === null ? null : Number(payload.prixhorszone);
      await axios.put(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/car/${id}`, payload);
      setVehicle(prev => prev ? { ...prev, ...payload } : null);
      toast.success('Véhicule mis à jour avec succès');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast.error('Erreur lors de la mise à jour du véhicule');
    }
  };

  const handleDeleteVehicle = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
      try {
        await axios.delete(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/car/${id}`);
        toast.success('Véhicule supprimé avec succès');
        navigate('/owner/dashboard');
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        toast.error('Erreur lors de la suppression du véhicule');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
     </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Véhicule non trouvé</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="sticky top-0 bg-white shadow text-black p-3">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white"
          >
            ←
          </button>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">
              {isEditing ? (
                <input
                  type="text"
                  name="marque"
                  value={editedVehicle.marque || ''}
                  onChange={handleInputChange}
                  className="bg-gray-800 text-white p-2 rounded"
                />
              ) : (
                `${vehicle.marque} ${vehicle.modele}`
              )}
            </h1>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="primary" className="!py-2" onClick={handleUpdateVehicle}>
                    Enregistrer
                  </Button>
                  <Button variant="secondary" className="!py-2" onClick={() => setIsEditing(false)}>
                    Annuler
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    className="!py-2"
                    onClick={() => navigate(`/owner/vehicle/edit/${vehicle.id}`, { state: { vehicle } })}
                  >
                    <EditIcon size={15} />
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="!py-2 !bg-red-900 hover:!bg-red-800"
                    onClick={handleDeleteVehicle}
                  >
                    <TrashIcon size={15} />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mb-14 mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vehicle Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-64 bg-cover bg-center" style={{
                backgroundImage: `url(${vehicle.photofront})`
              }}></div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          name="modele"
                          value={editedVehicle.modele || ''}
                          onChange={handleInputChange}
                          className="bg-gray-100 p-2 rounded mb-2 w-full"
                        />
                        <input
                          type="number"
                          name="prix"
                          value={editedVehicle.prix || ''}
                          onChange={handleInputChange}
                          className="bg-gray-100 p-2 rounded w-full"
                        />
                        <input
                          type="number"
                          name="prixhorszone"
                          value={editedVehicle.prixhorszone ?? ''}
                          onChange={handleInputChange}
                          className="bg-gray-100 p-2 rounded w-full mt-2"
                        />
                      </>
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold">{vehicle.marque} {vehicle.modele}</h2>
                        <p className="text-gray-600">{vehicle.prix} FCFA/jour</p>
                        {vehicle.prixhorszone !== undefined && vehicle.prixhorszone !== null && (
                          <p className="text-gray-500">Prix hors zone: {vehicle.prixhorszone} FCFA</p>
                        )}
                      </>
                    )}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    vehicle.statut === 'disponible' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {vehicle.statut === 'disponible' ? 'Disponible' : 'Indisponible'}
                  </div>
                </div>

                {isEditing ? (
                  <textarea
                    name="description"
                    value={editedVehicle.description || ''}
                    onChange={handleInputChange}
                    rows={4}
                    className="bg-gray-100 p-2 rounded w-full"
                  />
                ) : (
                  <p className="text-gray-600">{vehicle.description}</p>
                )}

                {/* Features */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="flex items-center">
                    {isEditing ? (
                      <input
                        type="checkbox"
                        name="sunroof"
                        checked={editedVehicle.sunroof || false}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                    ) : (
                      <span className="flex items-center justify-between font-semibold bg-black rounded-full mr-2 p-1"><SunIcon size={18} className={vehicle.sunroof ? 'text-[#3EFEFE]' : 'text-white'} />  </span>
                    )}
                    <span>Toit ouvrant</span>
                  </div>
                  <div className="flex items-center">
                    {isEditing ? (
                      <input
                        type="checkbox"
                        name="androidauto"
                        checked={editedVehicle.androidauto || false}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                    ) : (
                      <span className="flex items-center justify-between font-semibold bg-black rounded-full mr-2 p-1"><SmartphoneIcon size={18} className={vehicle.androidauto ? 'text-[#3EFEFE]' : 'text-white'} />  </span>
                    )}
                    <span>Android Auto</span>
                  </div>
                  <div className="flex items-center">
                    {isEditing ? (
                      <input
                        type="checkbox"
                        name="clime"
                        checked={editedVehicle.clime || false}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                    ) : (
                      <span className="flex items-center justify-between font-semibold bg-black rounded-full mr-2 p-1"><SnowflakeIcon size={18} className={vehicle.clime ? 'text-[#3EFEFE]' : 'text-white'} />  </span>
                    )}
                    <span>Climatisation</span>
                  </div>
                  <div className="flex items-center">
                    {isEditing ? (
                      <input
                        type="checkbox"
                        name="bluetooth"
                        checked={editedVehicle.bluetooth || false}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                    ) : (
                      <span className="flex items-center justify-between font-semibold bg-black rounded-full mr-2 p-1"><BluetoothIcon size={18} className={vehicle.bluetooth ? 'text-[#3EFEFE]' : 'text-white'} />  </span>
                    )}
                    <span>Bluetooth</span>
                  </div>
                </div>

                {/* Affichage du carburant et de la commission */}
                <div className="mt-4  flex justify-between gap-2">
                  <div className='flex items-center mr-1 justify-between'>
                    <span className="flex items-center justify-between font-semibold bg-black rounded-full mr-2 p-1"><FuelIcon size={18} className='text-[#3EFEFE]' /> </span> {vehicle.fuel || 'Non renseigné'} 
                  </div>
                  <div className='flex items-center ml-1 justify-between'>
                    <span className="flex items-center justify-between font-semibold bg-black rounded-full mr-2 p-1"> <SettingsIcon size={18} className='text-[#3EFEFE]' /> </span> {vehicle.boiteVitesse || 'Non renseigné'} 
                  </div>

                  <div>
                    {/* <span className="font-semibold">Caution  45 : </span> */}
                    {/* <span>
                      {vehicle.comission ? (
                        <span className="text-green-600 font-semibold">Oui</span>
                      ) : (
                        <span className="text-red-600 font-semibold">Non</span>
                      )}
                    </span> */}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Requests */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">
                Demandes de réservation
              </h3>
              <div className="space-y-4">
                {lastReservation ? (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">
                        {lastReservation.date_debut && lastReservation.date_fin
                          ? `${new Date(lastReservation.date_debut).toLocaleDateString()} - ${new Date(lastReservation.date_fin).toLocaleDateString()}`
                          : 'Dates inconnues'}
                      </p>
                      <p className="text-gray-600">
                        {lastReservation.nom_conducteur || 'Conducteur inconnu'}
                        {lastReservation.duree ? ` - ${lastReservation.duree} jours` : ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-full">
                        <CheckCircleIcon size={24} />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-full">
                        <XCircleIcon size={24} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 italic">Aucune demande récente</div>
                )}
              </div>
            </div>            
          </div>

          {/* Availability Calendar */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Disponibilité</h3>
              <Button variant="primary" className="!py-2" onClick={() => setShowCalendar(!showCalendar)}>
                <CalendarIcon size={20} />
                Gérer
              </Button>
            </div>
            {showCalendar && vehicle && (
              <Calendar carId={vehicle.id} />
            )}
          </div>
        </div>
      </main>
      {/* Mobile bottom navigation */} 
      {/* <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="flex justify-around p-4">
          <button onClick={() => navigate('/owner/dashboard')} className="flex flex-col items-center gap-1 text-[#3EFEFE]">
            <BarChart3Icon size={20} />
            <span className="text-xs">Dashboard</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400"
            onClick={() => navigate('/owner/vehicle/OwnerVehicles')}>
            <CarIcon size={20} />
            <span className="text-xs">Véhicules</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400">
            <BellIcon size={20} />
            <span className="text-xs">Notifications</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 text-gray-400"
            onClick={() => navigate('/owner/profile')}
          >
            <UserIcon size={20} />
            <span className="text-xs">Profil</span>
          </button>
        </div>
      </nav> */}
    </div>
  );
};

export default VehicleDetails;