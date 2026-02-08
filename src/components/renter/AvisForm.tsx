import React, { useState, useEffect } from 'react';
import { StarIcon, CheckIcon, XIcon, CarIcon, CalendarIcon } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import axios from 'axios';

interface AvisFormProps {
  id_reservation: string;
  voiture: string;
  conducteur: string;
  date_debut: string;
  date_fin: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface CarData {
  marque: string;
  modele: string;
  annee: number;
  photofront: string;
  proprio: string; // <-- ici, pas "proprietaire"
}

const AvisForm: React.FC<AvisFormProps> = ({
  id_reservation,
  voiture,
  conducteur,
  date_debut,
  date_fin,
  onSuccess,
  onCancel
}) => {
  // Log des props reçues pour debug
  console.log("AvisForm props :", {
    id_reservation,
    voiture,
    conducteur,
    date_debut,
    date_fin
  });

  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [car, setCar] = useState<CarData | null>(null);
  const [ownerCompany, setOwnerCompany] = useState<string | null>(null);

  // Récupérer les infos du véhicule (y compris le propriétaire)
  useEffect(() => {
    const fetchCarAndOwner = async () => {
      try {
        const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/cars/car/${voiture}`);
        setCar(res.data);
        console.log("Car data fetched:", res.data);

        if (res.data?.proprio) {
          const ownerRes = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/owners/getOwner/${res.data.proprio}`);
          setOwnerCompany(ownerRes.data.companyname);
          console.log("Owner data fetched:", ownerRes.data);
        } else {
          setOwnerCompany(null);
        }
      } catch (err) {
        setCar(null);
        setOwnerCompany(null);
      }
    };
    fetchCarAndOwner();
  }, [voiture]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Définir un commentaire par défaut si aucun n'est saisi
      let commentaireToSend = comment;
      if (!commentaireToSend.trim()) {
        if (rating === 1) commentaireToSend = "Expérience très décevante.";
        else if (rating === 2) commentaireToSend = "Expérience en dessous des attentes.";
        else if (rating === 3) commentaireToSend = "Expérience correcte, sans plus.";
        else if (rating === 4) commentaireToSend = "Bonne expérience avec ce véhicule.";
        else if (rating === 5) commentaireToSend = "Excellente expérience, je recommande !";
        else commentaireToSend = "Avis sans commentaire.";
      }
      // Utilise le propriétaire récupéré depuis l'API voiture
      await axios.post('https://qxmaqyf9jt.us-east-1.awsapprunner.com/ratings/rating', {
        id_reservation,
        voiture,
        proprietaire: car?.proprio, // <-- ici
        conducteur,
        points: rating,
        commentaire: commentaireToSend
      });

      toast.success('Merci pour votre avis !');
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("Une erreur est survenue lors de l'envoi de votre avis");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold">Donner votre avis</h2>
        {onCancel && (
          <button 
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <XIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4 mb-3">
          {car?.photofront ? (
            <img
              src={car.photofront}
              alt={car ? `${car.marque} ${car.modele}` : ''}
              className="w-16 h-16 object-cover rounded"
            />
          ) : (
            <div className="w-16 h-16 flex items-center justify-center bg-gray-200 rounded">
              <CarIcon className="h-8 w-8 text-gray-400" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-lg">
              {car
                ? `${car.marque} ${car.modele}${ownerCompany ? " (" + ownerCompany + ")" : ""}`
                : "Chargement..."}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CalendarIcon className="h-4 w-4" />
              <span>
                {new Date(date_debut).toLocaleDateString()} - {new Date(date_fin).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-lg font-medium mb-3">
            Comment notez-vous ce véhicule ?
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
              >
                <StarIcon
                  className={`h-10 w-10 ${
                    (hoverRating || rating) >= star 
                      ? 'text-yellow-400 fill-yellow-400' 
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>Pas satisfait</span>
            <span>Très satisfait</span>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="comment" className="block text-lg font-medium mb-3">
            Votre commentaire (optionnel)
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Décrivez votre expérience avec ce véhicule..."
            className="resize-none w-full border rounded p-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            Votre avis aidera d'autres utilisateurs à faire leur choix.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 border rounded bg-white text-gray-700 hover:bg-gray-100"
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            disabled={rating === 0 || isSubmitting}
            className="px-4 py-2 rounded bg-[#3EFEFE] hover:bg-[#c0e639] text-black font-semibold flex items-center gap-2"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                Envoi en cours...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4" />
                Envoyer l'avis
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AvisForm;