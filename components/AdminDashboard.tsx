import React, { useState, useCallback } from 'react';
import type { PlayerData, Week, RankingPlayer } from '../types';
import { PlayerForm } from './PlayerForm';
import { RankingTable } from './RankingTable';
import { WeeklyResultForm } from './WeeklyResultForm';
import { WeekHistory } from './WeekHistory';
import { useAuth } from '../contexts/AuthContext';

interface AdminDashboardProps {
    players: PlayerData[];
    weeks: Week[];
    rankingPlayers: RankingPlayer[];
    onAddPlayer: (name: string) => void;
    onRemovePlayer: (id: string) => void;
    onUpdatePlayer: (playerId: string, updatedData: Partial<PlayerData>) => void;
    onWeekSubmit: (results: { playerId: string; rank: number }[], isDoubled: boolean, weekIdToUpdate?: string) => void;
    onDeleteWeek: (weekId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
    const { 
        players, weeks, rankingPlayers, onAddPlayer, onRemovePlayer, 
        onUpdatePlayer, onWeekSubmit, onDeleteWeek 
    } = props;
    
    const [editingWeek, setEditingWeek] = useState<Week | null>(null);
    const [isSubmittingWeek, setIsSubmittingWeek] = useState(false);
    const { user, logout } = useAuth();

    const handleEditWeek = useCallback((week: Week) => {
        setEditingWeek(week);
        setIsSubmittingWeek(true);
    }, []);

    const handleWeekSubmitWrapper = (results: { playerId: string; rank: number }[], isDoubled: boolean, weekIdToUpdate?: string) => {
        onWeekSubmit(results, isDoubled, weekIdToUpdate);
        setIsSubmittingWeek(false);
        setEditingWeek(null);
    };

    const handleCancelSubmit = () => {
        setIsSubmittingWeek(false);
        setEditingWeek(null);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-slate-700">
                     <div className="text-left mb-4 sm:mb-0">
                        <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                            Painel do Administrador
                        </h1>
                        <p className="text-slate-400 mt-1">
                            Bem-vindo, <span className="font-semibold text-cyan-400">{user?.email}</span>!
                        </p>
                     </div>
                     <button
                        onClick={logout}
                        className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors self-end sm:self-center"
                    >
                        Sair
                    </button>
                </header>

                <main>
                    {isSubmittingWeek ? (
                        <WeeklyResultForm
                            players={players}
                            onSubmit={handleWeekSubmitWrapper}
                            onCancel={handleCancelSubmit}
                            weekToEdit={editingWeek}
                        />
                    ) : (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                                <div className="lg:col-span-1">
                                    <PlayerForm onAddPlayer={onAddPlayer} />
                                </div>
                                <div className="lg:col-span-2 bg-slate-800/50 rounded-xl p-6 shadow-lg border border-slate-700">
                                    <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Gerenciar Classificação</h2>
                                    <RankingTable 
                                        players={rankingPlayers} 
                                        isAdmin={true} 
                                        onRemovePlayer={onRemovePlayer} 
                                        onUpdatePlayer={onUpdatePlayer} 
                                    />
                                </div>
                            </div>
                            <div className="flex justify-center mt-8">
                                <button
                                    onClick={() => setIsSubmittingWeek(true)}
                                    disabled={players.length === 0}
                                    className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center text-lg"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    Enviar Resultados da Semana
                                </button>
                            </div>
                            <WeekHistory
                                weeks={weeks}
                                players={players}
                                isAdmin={true}
                                onEdit={handleEditWeek}
                                onDelete={onDeleteWeek}
                            />
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};