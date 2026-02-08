import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Trash2Icon } from 'lucide-react';

interface Reservation {
  id: string;
  conducteur: string;
  voiture: string;
  proprietaire: string;
  date_debut: string;
  date_fin: string;
  avance: number;
  caution: number;
  livraison: number;
  heuredeprise: string;
  heurederetour: number;
  totale: number;
  statut: number;
  latitude: string;
  longitude: string;
  created_at: string;
}

interface AdminReservationCardProps {
  reservation: Reservation;
  onReservationUpdated?: () => void;
  onDelete?: () => void; // Ajoute cette ligne
}

const AdminReservationCard: React.FC<AdminReservationCardProps> = ({ reservation, onReservationUpdated, onDelete }) => {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    date_debut: reservation.date_debut,
    date_fin: reservation.date_fin,
    avance: reservation.avance,
    caution: reservation.caution,
    livraison: reservation.livraison,
    heuredeprise: reservation.heuredeprise,
    heurederetour: reservation.heurederetour,
    totale: reservation.totale,
    statut: reservation.statut,
  });
  const [loading, setLoading] = useState(false);
  const [carName, setCarName] = useState<string>("");
  const [driverName, setDriverName] = useState<string>("");

  useEffect(() => {
    const fetchCarName = async () => {
      try {
        const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/car/${reservation.voiture}`);
        setCarName(`${res.data.marque} ${res.data.modele}`);
      } catch {
        setCarName("Véhicule inconnu");
      }
    };
    fetchCarName();
  }, [reservation.voiture]);

  useEffect(() => {
    const fetchDriverName = async () => {
      try {
        const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/renters/getRenter/${reservation.conducteur}`);
        setDriverName(res.data.fullname || res.data.full_name || "Conducteur inconnu");
      } catch {
        setDriverName("Conducteur inconnu");
      }
    };
    fetchDriverName();
  }, [reservation.conducteur]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await axios.put(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/reservations/updateReservation/${reservation.id}`, form);
      setEditMode(false);
      // Notification au propriétaire lors de la modification
      try {
        await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/notifications/addNotification', {
          userId: reservation.proprietaire,
          type: 'reservation_modifiee',
          title: 'Réservation modifiée par l\'admin',
          message: `Votre réservation sur le véhicule ${carName} a été modifiée par l'administrateur.`,
          link: `/owner/reservations/${reservation.id}`,
          meta: {
            reservationId: reservation.id,
            voiture: reservation.voiture,
            conducteur: reservation.conducteur
          }
        });
        console.log('[LOG] Notification propriétaire modification réservation envoyée');
      } catch (notifErr) {
        console.error('[Notification] Erreur notification modification réservation propriétaire:', notifErr);
      }
      // Notification au conducteur lors de la modification
      try {
        await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/notifications/addNotification', {
          userId: reservation.conducteur,
          type: 'reservation_modifiee',
          title: 'Réservation modifiée par l\'admin',
          message: `Votre réservation sur le véhicule ${carName} a été modifiée par l'administrateur.`,
          link: `/renter/reservations/${reservation.id}`,
          meta: {
            reservationId: reservation.id,
            voiture: reservation.voiture,
            proprietaire: reservation.proprietaire
          }
        });
        console.log('[LOG] Notification conducteur modification réservation envoyée');
      } catch (notifErr) {
        console.error('[Notification] Erreur notification modification réservation conducteur:', notifErr);
      }
      if (onReservationUpdated) onReservationUpdated();
    } catch (err) {
      alert("Erreur lors de la mise à jour.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-b border-gray-800 pb-4 last:border-b-0 bg-black rounded-lg shadow-sm p-3 mb-3">
      <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
        <div>
          <p className="font-bold text-[#3EFEFE]">Réservation #{reservation.id}</p>
          <p className="text-sm text-white">
            {new Date(reservation.date_debut).toLocaleDateString()} - {new Date(reservation.date_fin).toLocaleDateString()}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <p className="text-sm text-white">
              <span className="font-bold text-[#3EFEFE]">Voiture :</span> {carName || "Chargement..."}
            </p>
            <p className="text-sm text-white">
              <span className="font-bold text-[#3EFEFE]">Conducteur :</span> {driverName || "Chargement..."}
            </p>
            <p className="text-sm text-white"><span className="font-bold text-[#3EFEFE]">Heure de prise :</span> {reservation.heuredeprise}</p>
            <p className="text-sm text-white"><span className="font-bold text-[#3EFEFE]">Heure de retour :</span> {reservation.heurederetour}h</p>
            <p className="text-sm text-white"><span className="font-bold text-[#3EFEFE]">Livraison :</span> {reservation.livraison} FCFA</p>
            <p className="text-sm text-white"><span className="font-bold text-[#3EFEFE]">Avance :</span> {reservation.avance}</p>
            <p className="text-sm text-white"><span className="font-bold text-[#3EFEFE]">Caution :</span> {reservation.caution}</p>
          </div>
        </div>
        <div className="text-right flex flex-col items-end justify-between">
          <p className="font-bold text-[#3EFEFE]">{reservation.totale} FCFA</p>
          <span className={`text-xs px-2 py-1 rounded font-bold ${
            reservation.statut === 1
              ? 'bg-green-100 text-green-800'
              : reservation.statut === 0
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {reservation.statut === 1
              ? 'Confirmée'
              : reservation.statut === 0
              ? 'En attente'
              : 'Annulée'}
          </span>
        </div>
      </div>
      <div className="mt-2 flex flex-col sm:flex-row sm:justify-between text-sm gap-2">
        <Link
          to={`/admin/reservations/${reservation.id}`}
          className="text-blue-400 hover:text-blue-200 font-bold"
        >
          Voir détails
        </Link>
        <div className="flex gap-2">
          <button
            className="text-xs text-white bg-[#3EFEFE] hover:bg-[#b6e62f] px-3 py-1 rounded font-bold"
            onClick={() => setEditMode(true)}
          >
            Modifier
          </button>
          <button
            className="text-xs text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded font-bold flex items-center gap-1"
            onClick={async () => {
              if (window.confirm("Voulez-vous vraiment supprimer cette réservation ?")) {
                try {
                  await axios.delete(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/reservations/supprimer/${reservation.id}`);
                  // Notification au propriétaire lors de la suppression
                  try {
                    await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/notifications/addNotification', {
                      userId: reservation.proprietaire,
                      type: 'reservation_supprimee',
                      title: 'Réservation supprimée par l\'admin',
                      message: `Votre réservation sur le véhicule ${carName} a été supprimée par l'administrateur.`,
                      link: `/owner/reservations`,
                      meta: {
                        reservationId: reservation.id,
                        voiture: reservation.voiture,
                        conducteur: reservation.conducteur
                      }
                    });
                    console.log('[LOG] Notification propriétaire suppression réservation envoyée');
                  } catch (notifErr) {
                    console.error('[Notification] Erreur notification suppression réservation propriétaire:', notifErr);
                  }
                  // Notification au conducteur lors de la suppression
                  try {
                    await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/notifications/addNotification', {
                      userId: reservation.conducteur,
                      type: 'reservation_supprimee',
                      title: 'Réservation supprimée par l\'admin',
                      message: `Votre réservation sur le véhicule ${carName} a été supprimée par l'administrateur.`,
                      link: `/renter/reservations`,
                      meta: {
                        reservationId: reservation.id,
                        voiture: reservation.voiture,
                        proprietaire: reservation.proprietaire
                      }
                    });
                    console.log('[LOG] Notification conducteur suppression réservation envoyée');
                  } catch (notifErr) {
                    console.error('[Notification] Erreur notification suppression réservation conducteur:', notifErr);
                  }
                  if (onDelete) onDelete();
                } catch (err) {
                  alert("Erreur lors de la suppression.");
                }
              }
            }}
          >
            <Trash2Icon className="w-4 h-4" />
            Supprimer
          </button>
        </div>
      </div>

      {/* Modal d'édition */}
      {editMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 overflow-y-auto">
          <div className="bg-white rounded-lg p-4 w-[95vw] max-w-md relative mx-2">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
              onClick={() => setEditMode(false)}
              title="Fermer"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold mb-4">Modifier la réservation</h3>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold">Date début</label>
              <input type="date" name="date_debut" value={form.date_debut?.slice(0,10)} onChange={handleChange} className="border rounded px-2 py-1" />
              <label className="text-xs font-bold">Date fin</label>
              <input type="date" name="date_fin" value={form.date_fin?.slice(0,10)} onChange={handleChange} className="border rounded px-2 py-1" />
              <label className="text-xs font-bold">Avance</label>
              <input type="number" name="avance" value={form.avance} onChange={handleChange} className="border rounded px-2 py-1" />
              <label className="text-xs font-bold">Caution</label>
              <input type="number" name="caution" value={form.caution} onChange={handleChange} className="border rounded px-2 py-1" />
              <label className="text-xs font-bold">Livraison</label>
              <input type="number" name="livraison" value={form.livraison} onChange={handleChange} className="border rounded px-2 py-1" />
              <label className="text-xs font-bold">Heure de prise</label>
              <input type="text" name="heuredeprise" value={form.heuredeprise} onChange={handleChange} className="border rounded px-2 py-1" />
              <label className="text-xs font-bold">Heure de retour</label>
              <input type="number" name="heurederetour" value={form.heurederetour} onChange={handleChange} className="border rounded px-2 py-1" />
              <label className="text-xs font-bold">Total</label>
              <input type="number" name="totale" value={form.totale} onChange={handleChange} className="border rounded px-2 py-1" />
              <label className="text-xs font-bold">Statut</label>
              <select name="statut" value={form.statut} onChange={handleChange} className="border rounded px-2 py-1">
                <option value={0}>En attente</option>
                <option value={1}>Confirmée</option>
                <option value={2}>Annulée</option>
              </select>
            </div>
            <button
              className="mt-4 w-full bg-[#3EFEFE] text-black font-bold py-2 rounded hover:bg-[#b6e62f] transition"
              onClick={handleUpdate}
              disabled={loading}
            >
              {loading ? "Mise à jour..." : "Enregistrer"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReservationCard;