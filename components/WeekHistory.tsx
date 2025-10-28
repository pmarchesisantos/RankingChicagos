import React from 'react';
import type { Week, PlayerData } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';

interface WeekHistoryProps {
    weeks: Week[];
    players: PlayerData[];
    onEdit: (week: Week) => void;
    onDelete: (weekId: string) => void;
}

export const WeekHistory: React.FC<WeekHistoryProps> = ({ weeks, players, onEdit, onDelete }) => {
    const getPlayerName = (playerId: string) => {
        return players.find(p => p.id === playerId)?.name || 'Jogador desconhecido';
    };

    if (weeks.length === 0) {
        return null; // Não renderiza nada se não houver histórico
    }

    return (
        <div className="mt-12">
            <h2 className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Histórico Semanal</h2>
            <div className="space-y-4 max-w-4xl mx-auto">
                {weeks.slice().reverse().map(week => (
                    <div key={week.id} className="bg-slate-800/50 rounded-xl p-4 shadow-lg border border-slate-700 flex flex-col sm:flex-row justify-between items-center">
                        <div className="flex-1 mb-4 sm:mb-0">
                            <p className="font-bold text-lg text-white flex items-center flex-wrap">
                                Semana de {new Date(week.date).toLocaleDateString('pt-BR')}
                                {week.isDoubled && <span className="ml-3 mt-1 sm:mt-0 text-xs font-semibold text-cyan-300 bg-cyan-800/60 px-2 py-1 rounded-full uppercase tracking-wider">Pontos Dobrados</span>}
                            </p>
                            <p className="text-sm text-slate-400 mt-1">
                                Participantes: {week.results.map(r => getPlayerName(r.playerId)).join(', ')}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => onEdit(week)} 
                                className="bg-slate-600 hover:bg-slate-500 text-white font-bold p-2 rounded-lg flex items-center transition-colors"
                                aria-label={`Editar semana de ${new Date(week.date).toLocaleDateString()}`}
                            >
                                <PencilIcon className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => onDelete(week.id)} 
                                className="bg-red-700 hover:bg-red-600 text-white font-bold p-2 rounded-lg flex items-center transition-colors"
                                aria-label={`Excluir semana de ${new Date(week.date).toLocaleDateString()}`}
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};