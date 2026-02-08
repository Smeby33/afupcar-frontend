import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import axios from 'axios';

interface RevenueData {
  date: string;
  amount: number;
}

interface RevenueChartProps {
  period?: 'weekly' | 'monthly' | 'yearly' | 'custom';
  customRange?: { start: string; end: string };
  lineColor?: string;
  height?: number | string;
  showValues?: boolean;
  currency?: string;
}

const RevenueChart: React.FC<RevenueChartProps> = ({
  period = 'weekly',
  customRange,
  lineColor = '#3b82f6',
  height = '400',
  showValues = true,
  currency = '€'
}) => {
  const [data, setData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodState, setPeriodState] = useState<'weekly' | 'monthly' | 'yearly' | 'custom'>(period);
  const [customRangeState, setCustomRangeState] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const auth = getAuth();

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error('Utilisateur non connecté');
        }

        let url = '';
        const ownerId = user.uid;

        switch (periodState) {
          case 'weekly':
            url = `https://qxmaqyf9jt.us-east-1.awsapprunner.com/reservations/revenue/weekly/${ownerId}`;
            break;
          case 'monthly':
            url = `https://qxmaqyf9jt.us-east-1.awsapprunner.com/reservations/revenue/monthly/${ownerId}`;
            break;
          case 'yearly':
            url = `https://qxmaqyf9jt.us-east-1.awsapprunner.com/reservations/revenue/yearly/${ownerId}`;
            break;
          case 'custom':
            if (!customRangeState) throw new Error('Période personnalisée requiert une plage de dates');
            url = `https://qxmaqyf9jt.us-east-1.awsapprunner.com/reservations/revenue/custom/${ownerId}?start=${customRangeState.start}&end=${customRangeState.end}`;
            break;
          default:
            url = `https://qxmaqyf9jt.us-east-1.awsapprunner.com/reservations/revenue/weekly/${ownerId}`;
        }

        console.log('[RevenueChart] URL appelée :', url);

        const response = await axios.get(url);

        console.log('[RevenueChart] Réponse brute :', response.data);

        // Vérifie que response.data est bien un tableau
        if (!Array.isArray(response.data)) {
          setData([]);
          setError('Aucune donnée trouvée ou format inattendu');
          console.error('[RevenueChart] Format inattendu:', response.data);
          return;
        }

        const formattedData = response.data.map((item: any) => ({
          date: item.week_start || item.month || item.date || item.year,
          amount: item.amount
        }));

        console.log('[RevenueChart] Données formatées :', formattedData);

        setData(formattedData);
      } catch (err) {
        console.error('[RevenueChart] Erreur lors de la récupération des revenus:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [periodState, customRangeState, auth]);

  if (loading) {
    console.log('[RevenueChart] Chargement en cours...');
    return <div className="flex justify-center items-center" style={{ height: `${height}px` }}>
      Chargement des données...
    </div>;
  }

  if (error) {
    console.log('[RevenueChart] Erreur affichée :', error);
    return <div className="flex justify-center items-center text-red-500" style={{ height: `${height}px` }}>
      {error}
    </div>;
  }

  if (data.length === 0) {
    console.log('[RevenueChart] Aucune donnée à afficher');
    return <div className="flex justify-center items-center" style={{ height: `${height}px` }}>
      Aucune donnée disponible
    </div>;
  }

  // Trie les données par montant croissant
  const sortedData = [...data].sort((a, b) => a.amount - b.amount);

  const maxAmount = Math.max(...sortedData.map(item => item.amount));
  const minAmount = Math.min(...sortedData.map(item => item.amount));
  const range = maxAmount - minAmount || 1; // Éviter la division par zéro

  // Fonction pour formater les dates selon la période
  const formatLabel = (dateString: string) => {
    const date = new Date(dateString);
    switch (periodState) {
      case 'weekly':
        return `Sem. ${date.getWeek()}`; // Nécessite une extension Date
      case 'monthly':
        return date.toLocaleDateString('fr-FR', { month: 'short' });
      case 'yearly':
        return date.getFullYear();
      default:
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  // Générer le path SVG pour la ligne
  const generatePath = () => {
    if (sortedData.length === 0) return '';
    let d = '';
    for (let i = 0; i < sortedData.length; i++) {
      const x = (i / (sortedData.length - 1)) * 100;
      const y = ((maxAmount - sortedData[i].amount) / range) * 100;
      if (i === 0) {
        d = `M ${x} ${y}`;
      } else {
        const prevX = ((i - 1) / (sortedData.length - 1)) * 100;
        const prevY = ((maxAmount - sortedData[i - 1].amount) / range) * 100;
        const cpx = (prevX + x) / 2;
        d += ` Q ${cpx} ${prevY}, ${x} ${y}`;
      }
    }
    return d;
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <select
          value={periodState}
          onChange={e => setPeriodState(e.target.value as any)}
          className="border rounded px-2 py-1"
        >
          <option value="weekly">Semaine</option>
          <option value="monthly">Mois</option>
          <option value="yearly">Année</option>
          <option value="custom">Personnalisée</option>
        </select>
        {periodState === 'custom' && (
          <>
            <input
              type="date"
              value={customRangeState?.start || ''}
              onChange={e => {
                setError(null);
                setLoading(true);
                setData([]);
                setCustomRangeState((prev: any) => ({ ...prev, start: e.target.value }));
              }}
              className="border rounded px-2 py-1"
            />
            <input
              type="date"
              value={customRangeState?.end || ''}
              onChange={e => {
                setError(null);
                setLoading(true);
                setData([]);
                setCustomRangeState((prev: any) => ({ ...prev, end: e.target.value }));
              }}
              className="border rounded px-2 py-1"
            />
          </>
        )}
      </div>
      <div className="relative w-full" style={{ height: `${height}px` }}>
        {/* SVG pour le graphique en courbe */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Ligne de fond */}
          <path
            d={generatePath()}
            fill="none"
            stroke={lineColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Points sur la ligne */}
          {sortedData.map((item, index) => {
            const x = (index / (sortedData.length - 1)) * 100;
            const y = ((maxAmount - item.amount) / range) * 100;
            
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="3"
                  fill={lineColor}
                  className="transition-all duration-300 hover:r-4"
                />
                
                {/* Tooltip */}
                {showValues && (
                  <text
                    x={x}
                    y={y - 5}
                    textAnchor="middle"
                    fontSize="5"
                    fill="#333"
                    className="hidden group-hover:block"
                  >
                    {item.amount.toFixed(2)}{currency}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Axe X (dates) */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
          {sortedData.map((item, index) => (
            <div key={index} className="text-xs text-gray-500">
              {formatLabel(item.date)}
            </div>
          ))}
        </div>

        {/* Axe Y (montants) */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between py-2">
          {[maxAmount, Math.round(maxAmount * 0.66), Math.round(maxAmount * 0.33), minAmount].map((amount, i) => (
            <div key={i} className="text-xs text-gray-500">
              {amount.toFixed(2)}{currency}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Extension pour récupérer le numéro de semaine
declare global {
  interface Date {
    getWeek(): number;
  }
}

Date.prototype.getWeek = function() {
  const date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

export default RevenueChart;