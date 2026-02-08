import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CarIcon, CalendarCheck2Icon, PencilIcon, Trash2Icon } from 'lucide-react';
import AdminReservationCard from '../../components/admin/AdminReservationCard';
import Loader from '../../components/ui/Loader';

interface Car {
  id: string;
  marque: string;
  modele: string;
  type: string;
  description: string;
  ville: string;
  sunroof: number;
  androidauto: number;
  clime: number;
  bluetooth: number;
  photofront: string;
  photoback: string;
  photoleft: string;
  photorigth: string;
  prix: number;
  prixhorszone?: number | null;
  avance: number;
  proprio: string;
  statut: number;
  fuel: string;
  comission: number;
}

interface Reservation {
  id: string;
  // autres champs...
}

const AdminCarDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [carForm, setCarForm] = useState<Car | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'info' | 'reservations'>('info');
  const [ownerName, setOwnerName] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const response = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/car/${id}`);
        setCar(response.data);
        setCarForm(response.data);
      } catch (err) {
        setError('Erreur lors du chargement du véhicule');
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/reservations/Allreservations/byCar/${id}`);
        setReservations(response.data);
      } catch (err) {
        setReservations([]);
      } finally {
        setLoadingReservations(false);
      }
    };
    fetchReservations();
  }, [id]);

  useEffect(() => {
    if (car && car.proprio) {
      axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/owners/getOwner/${car.proprio}`)
        .then(res => setOwnerName(res.data.fullname || res.data.full_name || "Propriétaire inconnu"))
        .catch(() => setOwnerName("Propriétaire inconnu"));
    }
  }, [car]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!carForm) return;
    setCarForm({ ...carForm, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await axios.put(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/car/${id}`, carForm);
      setCar(carForm);
      setEditMode(false);
      // Notification au propriétaire lors de la modification du véhicule
      if (carForm && carForm.proprio) {
        try {
          await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/notifications/addNotification', {
            userId: carForm.proprio,
            type: 'vehicule_modifie',
            title: 'Véhicule modifié par l\'admin',
            message: `Votre véhicule ${carForm.marque} ${carForm.modele} a été modifié par l'administrateur.`,
            link: `/owner/vehicles/${carForm.id}`,
            meta: { carId: carForm.id }
          });
          console.log('[LOG] Notification propriétaire modification véhicule envoyée');
        } catch (notifErr) {
          console.error('[Notification] Erreur notification modification véhicule propriétaire:', notifErr);
        }
      }
    } catch (err) {
      alert("Erreur lors de la modification.");
    }
  };

  if (loading) return <Loader />;

  if (error || !car) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error || "Véhicule introuvable"}
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-black pb-16">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-gray-900 shadow-md">
        <div className="p-4 border-b border-gray-800 flex flex-col md:block items-center">
          <div className="flex w-full items-center justify-between md:block">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-[#3EFEFE] text-black font-bold hover:bg-[#b6e62f] transition flex items-center justify-center w-10 h-10"
              aria-label="Retour"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-[#3EFEFE] text-right flex-1 md:text-left">
              Véhicule
            </h2>
            <div className="w-10 h-10 hidden md:block" />
          </div>
        </div>
        <nav className="p-4">
          <ul className="flex flex-col gap-2">
            <li>
              <button
                className={`w-full flex items-center gap-2 px-4 py-2 rounded font-bold ${selectedTab === 'info' ? 'bg-[#3EFEFE] text-black' : 'bg-gray-800 text-white'}`}
                onClick={() => setSelectedTab('info')}
              >
                <CarIcon className="w-5 h-5" />
                <span>Information</span>
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center gap-2 px-4 py-2 rounded font-bold ${selectedTab === 'reservations' ? 'bg-[#3EFEFE] text-black' : 'bg-gray-800 text-white'}`}
                onClick={() => setSelectedTab('reservations')}
              >
                <CalendarCheck2Icon className="w-5 h-5" />
                <span>Réservations</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
      {/* Main Content */}
      <div className="flex-1 p-2 md:p-8 bg-white text-black">
        {(() => {
          switch (selectedTab) {
            case 'info':
              return (
                <div className="bg-white shadow rounded-lg overflow-hidden p-6 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Détail du Véhicule</h1>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditMode(!editMode)}
                        className="bg-[#3EFEFE] hover:bg-[#b6e62f] text-black p-2 rounded-full transition flex items-center justify-center"
                        aria-label="Modifier"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      {/*  */}
                      <button
                        onClick={async () => {
                          if (window.confirm("Voulez-vous vraiment supprimer ce véhicule ?")) {
                            try {
                              await axios.delete(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/car/${id}`);
                              navigate('/admin/cars');
                            } catch (err) {
                              alert("Erreur lors de la suppression.");
                            }
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition flex items-center justify-center"
                        aria-label="Supprimer"
                      >
                        <Trash2Icon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  {editMode && carForm ? (
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
                      <input className="border p-2 rounded" name="marque" value={carForm.marque} onChange={handleChange} placeholder="Marque" />
                      <input className="border p-2 rounded" name="modele" value={carForm.modele} onChange={handleChange} placeholder="Modèle" />
                      <input className="border p-2 rounded" name="type" value={carForm.type} onChange={handleChange} placeholder="Type" />
                      <input className="border p-2 rounded" name="ville" value={carForm.ville} onChange={handleChange} placeholder="Ville" />
                      <input className="border p-2 rounded" name="prix" value={carForm.prix} onChange={handleChange} placeholder="Prix" type="number" />
                      <input className="border p-2 rounded" name="prixhorszone" value={carForm.prixhorszone ?? ''} onChange={handleChange} placeholder="Prix hors zone" type="number" />
                      <input className="border p-2 rounded" name="avance" value={carForm.avance} onChange={handleChange} placeholder="Avance" type="number" />
                      <input className="border p-2 rounded" name="proprio" value={carForm.proprio} onChange={handleChange} placeholder="Propriétaire" />
                      <select className="border p-2 rounded" name="statut" value={carForm.statut} onChange={handleChange}>
                        <option value={1}>Actif</option>
                        <option value={0}>Inactif</option>
                      </select>
                      <input className="border p-2 rounded" name="fuel" value={carForm.fuel} onChange={handleChange} placeholder="Carburant" />
                      <input className="border p-2 rounded" name="comission" value={carForm.comission} onChange={handleChange} placeholder="Commission" type="number" />
                      <textarea className="border p-2 rounded col-span-2" name="description" value={carForm.description} onChange={handleChange} placeholder="Description" />
                      <button type="submit" className="col-span-2 bg-[#3EFEFE] text-black font-bold py-2 rounded hover:bg-[#b6e62f]">Enregistrer</button>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h2 className="text-lg font-bold mb-2">{car.marque} {car.modele}</h2>
                        <p className="mb-1"><span className="font-semibold">Type :</span> {car.type}</p>
                        <p className="mb-1"><span className="font-semibold">Description :</span> {car.description}</p>
                        <p className="mb-1"><span className="font-semibold">Ville :</span> {car.ville}</p>
                        <p className="mb-1"><span className="font-semibold">Prix :</span> {car.prix} FCFA</p>
                        <p className="mb-1"><span className="font-semibold">Prix hors zone :</span> {car.prixhorszone ?? 'N/A'} FCFA</p>
                        <p className="mb-1"><span className="font-semibold">Avance :</span> {car.avance} FCFA</p>
                        <p className="mb-1"><span className="font-semibold">Propriétaire :</span> {ownerName || "Chargement..."}</p>
                        <p className="mb-1"><span className="font-semibold">Statut :</span> {car.statut === 1 ? 'Actif' : 'Inactif'}</p>
                        <p className="mb-1"><span className="font-semibold">Carburant :</span> {car.fuel}</p>
                        <p className="mb-1"><span className="font-semibold">Commission :</span> {car.comission}%</p>
                        <p className="mb-1"><span className="font-semibold">Options :</span>
                          {car.sunroof ? " Toit ouvrant," : ""}
                          {car.androidauto ? " Android Auto," : ""}
                          {car.clime ? " Clim," : ""}
                          {car.bluetooth ? " Bluetooth" : ""}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <img src={car.photofront} alt="Avant" className="w-32 h-24 object-cover rounded" />
                        <img src={car.photoback} alt="Arrière" className="w-32 h-24 object-cover rounded" />
                        <img src={car.photoleft} alt="Gauche" className="w-32 h-24 object-cover rounded" />
                        <img src={car.photorigth} alt="Droite" className="w-32 h-24 object-cover rounded" />
                      </div>
                    </div>
                  )}
                </div>
              );
            case 'reservations':
              return (
                <div className="bg-white shadow rounded-lg overflow-hidden p-6">
                  <h2 className="text-lg font-bold mb-4">Réservations de ce véhicule</h2>
                  {loadingReservations ? (
                    <div className="text-gray-500">Chargement...</div>
                  ) : reservations.length > 0 ? (
                    reservations.map(reservation => (
                      <AdminReservationCard
                        key={reservation.id}
                        reservation={reservation}
                        onReservationUpdated={() => {
                          axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/reservations/voiture/${id}`).then(res => setReservations(res.data));
                        }}
                      />
                    ))
                  ) : (
                    <div className="text-gray-500">Aucune réservation pour ce véhicule.</div>
                  )}
                </div>
              );
            default:
              return null;
          }
        })()}
      </div>
    </div>
  );
};

export default AdminCarDetails;