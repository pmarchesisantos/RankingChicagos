import React from 'react';
import type { RankingPlayer, PlayerData } from '../types';
import { exportToExcel } from '../services/exportService';
import { DownloadIcon } from './icons/DownloadIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { TrashIcon } from './icons/TrashIcon';

interface RankingTableProps {
  players: RankingPlayer[];
  isAdmin: boolean;
  onRemovePlayer?: (id: string) => void;
  onUpdatePlayer?: (playerId: string, updatedData: Partial<PlayerData>) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
};

export const RankingTable: React.FC<RankingTableProps> = ({ players, isAdmin, onRemovePlayer, onUpdatePlayer }) => {
  const handleExport = () => {
    exportToExcel(players, 'ranking_jogadores');
  };

  const getRankColor = (rank: number) => {
    switch(rank) {
      case 1: return 'text-amber-400';
      case 2: return 'text-slate-300';
      case 3: return 'text-orange-400';
      default: return 'text-slate-400';
    }
  };

  const getNameColor = (rank: number) => {
    if (rank >= 1 && rank <= 8) return 'text-green-400';
    if (rank === 9 || rank === 10) return 'text-blue-400';
    return 'text-white';
  };

  const handleBlur = (e: React.FocusEvent<HTMLTableCellElement>, playerId: string, field: keyof PlayerData) => {
    if (!isAdmin || !onUpdatePlayer) return;

    const originalPlayer = players.find(p => p.id === playerId);
    if (!originalPlayer) return;

    const cell = e.currentTarget;
    const rawValue = cell.textContent?.trim() ?? '';
    let processedValue: string | number = rawValue;
    
    const originalValue = originalPlayer[field];

    if (typeof originalValue === 'number') {
        let numericString = rawValue;
        if (field === 'accumulatedValue') {
            // Remove R$, espaços, e converte vírgula em ponto para parsing
            numericString = rawValue.replace(/R\$\s?/, '').replace(/\./g, '').replace(',', '.');
        }
        processedValue = parseFloat(numericString);

        if (isNaN(processedValue)) {
            cell.textContent = field === 'accumulatedValue' ? formatCurrency(originalValue) : String(originalValue);
            return;
        }
    }
    
    if (processedValue === originalValue) return;

    onUpdatePlayer(playerId, { [field]: processedValue });
  };

  const totalAccumulatedValue = React.useMemo(() => 
    players.reduce((acc, player) => acc + (player.accumulatedValue || 0), 0), 
    [players]
  );

  return (
    <div>
      {players.length > 0 ? (
        <>
        <div className="overflow-auto max-h-[70vh] rounded-lg border border-slate-700">
          <table className="w-full text-left table-auto">
            <thead className="sticky top-0 bg-slate-800 z-10 border-b-2 border-slate-600 text-slate-400 uppercase text-sm">
              <tr>
                <th className="p-3">Pos.</th>
                <th className="p-3">Nome</th>
                <th className="p-3 text-center">Pontos Totais</th>
                <th className="p-3 text-center whitespace-nowrap">Pontos (Anterior)</th>
                <th className="p-3 text-center">Presenças</th>
                <th className="p-3 text-center">Vitórias</th>
                <th className="p-3 text-center whitespace-nowrap">Pontos no Dia</th>
                <th className="p-3 text-center whitespace-nowrap">Valor Acumulado</th>
                {isAdmin && <th className="p-3 text-center">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr key={player.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors last:border-b-0">
                  <td className={`p-3 font-bold text-lg ${getRankColor(player.rank)}`}>
                    <div className="flex items-center">
                      {player.rank <= 3 && <TrophyIcon className="w-5 h-5 mr-2" />}
                      {player.rank}
                    </div>
                  </td>
                  <td 
                    className={`p-3 font-medium ${getNameColor(player.rank)}`}
                    contentEditable={isAdmin}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleBlur(e, player.id, 'name')}
                  >
                    {player.name}
                  </td>
                  <td className="p-3 text-center text-cyan-400 font-semibold"
                    contentEditable={isAdmin}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleBlur(e, player.id, 'totalPoints')}
                  >
                    {player.totalPoints}
                  </td>
                  <td className="p-3 text-center text-slate-400"
                    contentEditable={isAdmin}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleBlur(e, player.id, 'previousTotalPoints')}
                  >{player.previousTotalPoints}</td>
                  <td className="p-3 text-center text-slate-300"
                    contentEditable={isAdmin}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleBlur(e, player.id, 'presence')}
                  >
                    {player.presence}
                  </td>
                  <td className="p-3 text-center text-amber-300"
                    contentEditable={isAdmin}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleBlur(e, player.id, 'wins')}
                  >
                    {player.wins}
                  </td>
                  <td className="p-3 text-center text-emerald-400"
                    contentEditable={isAdmin}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleBlur(e, player.id, 'pointsToday')}
                  >{player.pointsToday > 0 ? `+${player.pointsToday}` : player.pointsToday}</td>
                  <td 
                    className="p-3 text-center text-fuchsia-400"
                    contentEditable={isAdmin}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleBlur(e, player.id, 'accumulatedValue')}
                  >
                    {formatCurrency(player.accumulatedValue)}
                  </td>
                  {isAdmin && (
                    <td className="p-3 text-center">
                      <button onClick={() => onRemovePlayer?.(player.id)} className="text-red-500 hover:text-red-400 p-1" aria-label={`Remover ${player.name}`}>
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot className="sticky bottom-0 bg-slate-800 z-10 border-t-2 border-slate-600 font-bold">
              <tr>
                <td colSpan={7} className="p-3 text-right uppercase text-slate-400">Total Acumulado:</td>
                <td className="p-3 text-center text-fuchsia-400">{formatCurrency(totalAccumulatedValue)}</td>
                {isAdmin && <td className="p-3"></td>}
              </tr>
            </tfoot>
          </table>
        </div>
        {isAdmin && (
          <div className="mt-6 flex justify-end">
            <button onClick={handleExport} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
              <DownloadIcon className="w-5 h-5 mr-2" />
              Exportar para Excel
            </button>
          </div>
        )}
        </>
      ) : (
        <div className="text-center py-10 text-slate-500">
          <p>Nenhum jogador adicionado ainda.</p>
          {isAdmin && <p>Adicione um jogador para começar a acompanhar!</p>}
        </div>
      )}
    </div>
  );
};