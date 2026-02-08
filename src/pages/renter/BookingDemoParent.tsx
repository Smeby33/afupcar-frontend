import React, { useState, useEffect } from 'react';
import BookingCard from '../../components/renter/BookingCard';
import { toast } from 'sonner';

// Simule des réservations existantes pour la démo
const reservations = [
  { voiture: '1', date_debut: '2025-06-20', date_fin: '2025-06-22' },
  { voiture: '1', date_debut: '2025-06-25', date_fin: '2025-06-27' },
];

const BookingDemoParent: React.FC = () => {
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [vehiculeId] = useState('1'); // Id du véhicule courant

  // Vérifie la disponibilité à chaque changement de date
  useEffect(() => {
    if (!dateDebut || !dateFin) return;
    const start = new Date(dateDebut);
    const end = new Date(dateFin);
    const hasReservation = reservations.some(res => {
      if (res.voiture !== vehiculeId) return false;
      const resStart = new Date(res.date_debut);
      const resEnd = new Date(res.date_fin);
      return (start <= resEnd && end >= resStart);
    });
    if (hasReservation) {
      toast.error('Ce véhicule est déjà réservé sur cette période. Choisissez une autre date ou un autre véhicule.');
    }
  }, [dateDebut, dateFin, vehiculeId]);

  return (
    <div className="p-8">
      <BookingCard
        statut={false}
        dateDebut={dateDebut}
        setDateDebut={setDateDebut}
        dateFin={dateFin}
        setDateFin={setDateFin}
        withLivraison={false}
        setWithLivraison={() => {}}
        heurePrise={"09:00"}
        setHeurePrise={() => {}}
        nbJours={1}
        prixJour={10000}
        sousTotal={10000}
        total={10000}
        loading={false}
        handleBooking={() => alert('Réservation !')}
        geoLoading={false}
        onGetLocation={() => {}}
      />
      <div className="mt-4 text-sm text-gray-500">
        <b>Date début sélectionnée :</b> {dateDebut || 'Aucune'}<br />
        <b>Date fin sélectionnée :</b> {dateFin || 'Aucune'}
      </div>
    </div>
  );
};

export default BookingDemoParent;
