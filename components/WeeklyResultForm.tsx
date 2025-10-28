import React, { useState, useEffect, useMemo } from 'react';
import type { PlayerData, Week } from '../types';

interface WeeklyResultFormProps {
  players: PlayerData[];
  onSubmit: (results: { playerId: string; rank: number }[], isDoubled: boolean, weekIdToUpdate?: string) => void;
  onCancel: () => void;
  weekToEdit: Week | null;
}

export const WeeklyResultForm: React.FC<WeeklyResultFormProps> = ({ players, onSubmit, onCancel, weekToEdit }) => {
  const [ranks, setRanks] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isDoubled, setIsDoubled] = useState(false);

  useEffect(() => {
    if (weekToEdit) {
      const initialRanks = weekToEdit.results.reduce((acc, result) => {
        acc[result.playerId] = String(result.rank);
        return acc;
      }, {} as Record<string, string>);
      setRanks(initialRanks);
      setIsDoubled(weekToEdit.isDoubled || false);
    } else {
        setRanks({});
        setIsDoubled(false);
        setSearchTerm('');
    }
  }, [weekToEdit]);

  const handleRankChange = (playerId: string, value: string) => {
    setRanks(prev => ({ ...prev, [playerId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const results = Object.entries(ranks)
      .map(([playerId, rankStr]) => ({
        playerId,
        rank: parseInt(rankStr, 10),
      }))
      .filter(({ rank }) => !isNaN(rank) && rank > 0)
      .sort((a, b) => a.rank - b.rank);
    
    const rankSet = new Set<number>();
    for (const result of results) {
        if (rankSet.has(result.rank)) {
            alert(`Classificação duplicada encontrada: ${result.rank}. Por favor, garanta que todas as classificações sejam únicas.`);
            return;
        }
        rankSet.add(result.rank);
    }

    const sortedRanks = Array.from(rankSet).sort((a,b) => a - b);
    for(let i = 0; i < sortedRanks.length; i++) {
        if(sortedRanks[i] !== i + 1) {
            alert(`As classificações devem ser sequenciais (1, 2, 3...). Há um pulo na sequência. Posição esperada: ${i + 1}, encontrada: ${sortedRanks[i]}.`);
            return;
        }
    }

    if (results.length > 0) {
      onSubmit(results, isDoubled, weekToEdit?.id);
    } else {
      alert("Por favor, insira pelo menos uma classificação válida.");
    }
  };

  const filteredPlayers = useMemo(() => {
    if (!searchTerm) {
      return players.sort((a, b) => a.name.localeCompare(b.name));
    }
    return players
      .filter(player => player.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [players, searchTerm]);
  
  const title = weekToEdit ? "Editar Resultados da Semana" : "Enviar Resultados da Semana";

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 shadow-lg border border-slate-700 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-cyan-400">{title}</h2>
      <p className="text-slate-400 text-center mb-6">Insira a classificação de cada jogador que participou. Deixe em branco para os não participantes.</p>
      
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Pesquisar jogador..."
          className="w-full bg-slate-700 border-2 border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
        />
      </div>

      <div className="mb-4 flex items-center justify-center">
        <input
          type="checkbox"
          id="doubledStage"
          checked={isDoubled}
          onChange={(e) => setIsDoubled(e.target.checked)}
          className="h-5 w-5 rounded border-slate-500 text-cyan-600 focus:ring-cyan-500"
        />
        <label htmlFor="doubledStage" className="ml-3 text-lg font-medium text-white">
          Etapa Dobrada (Pontuação x2)
        </label>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
          {filteredPlayers.map(player => (
            <div key={player.id} className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg">
              <label htmlFor={`rank-${player.id}`} className="text-lg text-white font-medium">
                {player.name}
              </label>
              <input
                id={`rank-${player.id}`}
                type="number"
                min="1"
                value={ranks[player.id] || ''}
                onChange={(e) => handleRankChange(player.id, e.target.value)}
                placeholder="Pos."
                className="bg-slate-900 w-24 border-2 border-slate-600 rounded-lg p-2 text-white text-center focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
              />
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center gap-4">
          <button type="button" onClick={onCancel} className="bg-slate-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-500 transition-colors">
            Cancelar
          </button>
          <button type="submit" className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold py-2 px-6 rounded-lg hover:scale-105 transform transition-transform duration-300">
            Salvar Resultados
          </button>
        </div>
      </form>
    </div>
  );
};