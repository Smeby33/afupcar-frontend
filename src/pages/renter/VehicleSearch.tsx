import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CarIcon, ClockIcon, StarIcon,LayoutDashboardIcon,UserIcon } from 'lucide-react';
import VehicleCardRenter from '../../components/owner/VehicleCardRenter';
import logoBlanc from '../../../logo-blanc.png';
import axios from 'axios';
import { toast } from 'sonner';
import { getAuth } from "firebase/auth";

interface Vehicle {
  id: string;
  marque: string;
  modele: string;
  prix: number;
  prixhorszone?: number | null;
  photofront: string;
  photoback: string;
  photoleft: string;
  photoright: string; // Correction ici
  statut: string;
  fuel: string;
  ville: string;
  type: string; // Ajouté
  boiteVitesse: string; // Ajouté
}

const VehicleSearch: React.FC = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    ville: '',
    type: '',
    boite: '',
    prix: '', // Ajout du filtre prix
  });

  // Options pour les filtres déroulants
  const [filterOptions, setFilterOptions] = useState({
    villes: [] as string[],
    types: [] as string[],
    boites: [] as string[],
  });

  const [reservations, setReservations] = useState<any[]>([]); // À typer plus strictement si possible
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({ start: '', end: '' });
  const [visitMode, setVisitMode] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false); // État pour gérer l'affichage des filtres avancés

  // Ajoute cette ligne pour récupérer l'utilisateur connecté
  const auth = getAuth();
  const user = auth.currentUser;
  const conducteurId = user ? user.uid : null;

  const [entretiens, setEntretiens] = useState<any[]>([]); // À typer plus strictement si possible

  useEffect(() => {
    // Récupérer les villes dynamiquement
    const fetchVilles = async () => {
      try {
        const res = await axios.get('https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/allVilles');
        setFilterOptions(prev => ({ ...prev, villes: res.data }));
      } catch (e) {
        toast.error('Erreur lors du chargement des villes');
      }
    };
    fetchVilles();

    // Récupérer les véhicules pour les autres filtres
    const fetchVehicles = async () => {
      try {
        const response = await axios.get('https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/allCars');
        setVehicles(response.data);
        // Extraire dynamiquement types et boîtes
        const types = [...new Set(response.data.map((v: Vehicle) => v.type))] as string[];
        const boites = [...new Set(response.data.map((v: Vehicle) => v.boiteVitesse))] as string[];
        setFilterOptions(prev => ({ ...prev, types, boites }));
      } catch (error) {
        toast.error('Erreur lors du chargement des véhicules');
      } finally {
        setIsLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await axios.get('https://qxmaqyf9jt.us-east-1.awsapprunner.com/reservations/recuperer/allReservation');
        setReservations(res.data);
        console.log('[LOG] Réservations récupérées:', res.data); // <-- LOG récupération
      } catch (e) {
        toast.error('Erreur lors du chargement des réservations');
      }
    };
    fetchReservations();
  }, []);

  useEffect(() => {
    const fetchEntretiens = async () => {
      try {
        const res = await axios.get('https://qxmaqyf9jt.us-east-1.awsapprunner.com/entretients/allEntretients');
        setEntretiens(res.data);
        console.log('[LOG] Entretiens récupérés:', res.data);
      } catch (e) {
        toast.error('Erreur lors du chargement des entretiens');
      }
    };
    fetchEntretiens();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      ville: '',
      type: '',
      boite: '',
      prix: '', // reset aussi le filtre prix
    });
    setDateRange({ start: '', end: '' });
  };

  // Fonction pour vérifier la disponibilité d'un véhicule sur la période choisie
  const isVehicleAvailable = (vehicleId: string) => {
    if (!dateRange.start || !dateRange.end) return true; // Si pas de période, tout est dispo

    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);

    // On cherche une réservation qui chevauche la période sélectionnée
    const hasReservation = reservations.some(res => {
      if (res.voiture !== vehicleId) return false;
      const resStart = new Date(res.date_debut);
      const resEnd = new Date(res.date_fin);
      // Chevauchement de période
      const overlap = (start <= resEnd && end >= resStart);
      if (overlap) {
        console.log(`[DEBUG] Véhicule ${vehicleId} réservé du ${res.date_debut} au ${res.date_fin} => exclu`);
      }
      return overlap;
    });

    return !hasReservation; // true si PAS de réservation qui chevauche
  };

  // Fonction pour vérifier si un véhicule est en entretien sur la période choisie
  const isVehicleInEntretien = (vehicleId: string) => {
    if (!dateRange.start || !dateRange.end) return false;
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    return entretiens.some(ent => {
      if (ent.voiture !== vehicleId) return false;
      const entStart = new Date(ent.date);
      const entEnd = ent.date_fin ? new Date(ent.date_fin) : entStart;
      // Chevauchement de période
      return (start <= entEnd && end >= entStart);
    });
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    // Filtre par disponibilité sur la période
    if (!isVehicleAvailable(vehicle.id)) return false;

    // Filtre par ville
    if (filters.ville && vehicle.ville !== filters.ville) return false;
    
    // Filtre par type de véhicule
    if (filters.type && vehicle.type !== filters.type) return false;
    
    // Filtre par boîte de vitesse
    if (filters.boite && vehicle.boiteVitesse !== filters.boite) return false;
    
    // Filtre par entretien
    if (isVehicleInEntretien(vehicle.id)) return false;

    // Filtre par fourchette de prix
    if (filters.prix) {
      if (filters.prix === 'bas' && (vehicle.prix < 30000 || vehicle.prix > 55000)) return false;
      if (filters.prix === 'moyen' && (vehicle.prix < 60000 || vehicle.prix > 105000)) return false;
      if (filters.prix === 'eleve' && (vehicle.prix < 110000 || vehicle.prix > 500000)) return false;
    }
    
    return true;
  });

  // Ajoute cette fonction pour envoyer la période au backend
  const saveDateAuto = async () => {
    try {
      if (!conducteurId) {
        toast.error("Utilisateur non connecté.");
        return;
      }
      const payload = {
        conducteurId,
        dateDebut: dateRange.start,
        dateFin: dateRange.end
      };
      const res = await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/dateautos/addDateauto', payload);
      console.log("✅ [POST /dateauto] Réponse serveur :", res.data);
    } catch (err) {
      console.error("❌ [POST /dateauto] Erreur :", err);
    }
  };

  // Modifie la validation du modal pour appeler cette fonction
  const handleDateModalValidate = async () => {
    console.log('[LOG] Période choisie dans le modal:', dateRange);
    await saveDateAuto(); // Envoie la période au backend
    setDateModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      {/* <div className="md:hidden bg-gray-100 h-12 text-white p-2 flex items-center justify-between">
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ width: '60px' }}>
          <a href="/renter/dashboard" className="text-[#3EFEFE] text-sm hover:underline">
            <img
              src={logoBlanc}
              alt="Logo"
              className="my-10 w-50 h-auto"
            />
          </a>
        </div>
        <h1 className="text-xl font-bold">Rechercher un véhicule</h1>
      </div> */}

      <main className="container mx-auto p-4 md:p-6 max-w-6xl mb-16">
        {/* Desktop Header */}
        <div className="hidden md:block mb-6">
          <h1 className="text-2xl font-bold">Rechercher un véhicule</h1>
          <p className="text-gray-600">
            Trouvez le véhicule parfait pour votre voyage
          </p>
          
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              {/* Filtre Ville */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                <select
                  name="ville"
                  value={filters.ville}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Toutes les villes</option>
                  {filterOptions.villes.map(ville => (
                    <option key={ville} value={ville}>{ville}</option>
                  ))}
                </select>
              </div>
              
            </div>
            {/* Sélection de période */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Période</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={e => setDateRange(r => ({ ...r, start: e.target.value }))}
                  className="w-1/2 p-2 border border-gray-300 rounded-md"
                  min={new Date().toISOString().split('T')[0]}
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={e => setDateRange(r => ({ ...r, end: e.target.value }))}
                  className="w-1/2 p-2 border border-gray-300 rounded-md"
                  min={dateRange.start}
                />
              </div>
            </div>
            {/* Bouton pour afficher les filtres avancés */}
            
          </div>
          {/* Filtres avancés affichés à la demande */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-fade-in">
              {/* Filtre Prix */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix</label>
                <select
                  name="prix"
                  value={filters.prix}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Tous les prix</option>
                  <option value="bas">Bas (30 000 - 55 000 XAF)</option>
                  <option value="moyen">Moyen (60 000 - 105 000 XAF)</option>
                  <option value="eleve">Élevé (110 000 - 500 000 XAF)</option>
                </select>
              </div>
              {/* Filtre Boîte de vitesse */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Boîte de vitesse</label>
                <select
                  name="boite"
                  value={filters.boite}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Toutes les transmissions</option>
                  {filterOptions.boites.map(boite => (
                    <option key={boite} value={boite}>{boite}</option>
                  ))}
                </select>
              </div>
              {/* Filtre Type de véhicule */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de véhicule</label>
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Tous les types</option>
                  {filterOptions.types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
            </div>
          )}
          <div className="flex gap-2 justify-between mt-4">
            <button className="bg-[#3EFEFE] text-black px-4 py-2 rounded" onClick={resetFilters}>Réinitialiser</button>
            <div className="flex items-end justify-end">
              <button
                type="button"
                className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition flex items-center gap-2"
                onClick={() => setShowAdvancedFilters(f => !f)}
                title="Filtres avancés"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0013 13.414V19a1 1 0 01-1.447.894l-2-1A1 1 0 009 18v-4.586a1 1 0 00-.293-.707L2.293 6.707A1 1 0 012 6V4z" />
                </svg>
                <span className="hidden md:inline text-sm">Filtres avancés</span>
              </button>
          </div>
          </div>
        </div>

        {/* Résultats */}
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p>Chargement des véhicules...</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600">Aucun véhicule ne correspond à vos critères de recherche</p>
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-[#3EFEFE] text-black rounded-md"
            >
              Réinitialiser les filtres
            </button>
            
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVehicles.map((vehicle) => (
              <VehicleCardRenter
                key={vehicle.id}
                id={vehicle.id}
                name={`${vehicle.marque} ${vehicle.modele}`}
                price={vehicle.prix}
                prixhorszone={vehicle.prixhorszone}
                images={[
                  vehicle.photofront,
                  vehicle.photoback,
                  vehicle.photoleft,
                  vehicle.photoright // Correction ici
                ].filter(Boolean)}
                status={vehicle.statut}
                fuel={vehicle.fuel}
                ville={vehicle.ville}
                visitMode={visitMode}
                onClick={() => {
                  console.log('🚗 Navigation vers véhicule avec dates:', dateRange, 'visitMode:', visitMode);
                  navigate(`/renter/vehicle/${vehicle.id}`, {
                    state: { 
                      dateRange,
                      visitMode
                    }
                  });
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-[#222]" style={{ borderRadius: '40px 40px 40px 40px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',margin: '0 2px 15px 2px',borderBlockColor: '#222' }}>
        <div className="flex justify-around p-3">
          <button  onClick={() => navigate('/renter/dashboard')} className="flex flex-col items-center gap-1 text-white hover:text-[#3EFEFE]">
            <LayoutDashboardIcon size={18} />
            <span className="text-xs font-semibold">Dashboard</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-[#3EFEFE]"
            onClick={() => navigate('/renter/search')}>
            <CarIcon size={18} />
            <span className="text-xs">Recherche</span>
          </button>
          <button onClick={() => navigate('/renter/reservations')} className="flex flex-col items-center gap-1 text-white hover:text-[#3EFEFE]">
            <ClockIcon size={18} />
            <span className="text-xs">Réservations</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 text-white hover:text-[#3EFEFE]"
            onClick={() => navigate('/renter/profile')}
          >
            <UserIcon size={18} />
            <span className="text-xs">Profil</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default VehicleSearch;