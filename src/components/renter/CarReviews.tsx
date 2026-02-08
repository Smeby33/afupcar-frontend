import React, { useEffect, useState } from "react";
import { StarIcon } from "lucide-react";
import axios from "axios";

interface CarReviewsProps {
  ratings: any[];
  ratingsLoading: boolean;
}

interface RenterInfo {
  id: string;
  fullname: string;
  photo?: string;
}

const CarReviews: React.FC<CarReviewsProps> = ({ ratings, ratingsLoading }) => {
  const [renters, setRenters] = useState<{ [id: string]: RenterInfo }>({});

  useEffect(() => {
    // Récupère les infos de chaque conducteur unique
    const fetchRenters = async () => {
      const uniqueIds = Array.from(new Set(ratings.map(r => r.conducteur).filter(Boolean)));
      const rentersData: { [id: string]: RenterInfo } = {};
      await Promise.all(
        uniqueIds.map(async (id) => {
          try {
            const res = await axios.get(`https://qxmaqyf9jt.us-east-1.awsapprunner.com/renters/getRenter/${id}`);
            rentersData[id] = res.data;
            console.log(`Renter data for ${id}:`, res.data);
          } catch {
            rentersData[id] = { id, fullname: "Utilisateur", photo: undefined };
          }
        })
      );
      setRenters(rentersData);
    };
    if (!ratingsLoading && ratings.length > 0) {
      fetchRenters();
    }
  }, [ratings, ratingsLoading]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Avis des utilisateurs</h2>
      <div className="space-y-4">
        {ratingsLoading ? (
          <p className="text-gray-400">Chargement des avis...</p>
        ) : ratings.length === 0 ? (
          <p className="text-gray-400">Aucun avis pour ce véhicule.</p>
        ) : (
          ratings.map((rating, idx) => {
            if (idx >= 6) return null; // Limite à 6 avis
            const renter = renters[rating.conducteur];
            return (
              <div key={idx} className="flex items-start gap-4">
                <img
                  src={renter?.photo || "https://via.placeholder.com/50"}
                  alt={renter?.fullname || "Utilisateur"}
                  className="rounded-full w-12 h-12"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <StarIcon className="text-yellow-400" size={20} />
                    <span className="font-bold">
                      {renter?.fullname || "Utilisateur"}
                    </span>
                    <span className="text-sm text-gray-500">
                      {Array(rating.points).fill(0).map((_, i) => (
                        <StarIcon key={i} className="inline text-yellow-400" size={16} />
                      ))}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{rating.commentaire}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CarReviews;