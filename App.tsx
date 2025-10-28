import React, { useState, useCallback, useMemo, useEffect } from 'react';
// FIX: Using v8 SDK syntax for database operations.
import type { PlayerData, Week, RankingPlayer } from './types';
import { RankingTable } from './components/RankingTable';
import { AdminDashboard } from './components/AdminDashboard';
import { Login } from './components/Login';
import { useAuth } from './contexts/AuthContext';
import { PLACEMENT_POINTS } from './constants';
import { db } from './firebaseConfig';
import { WeekHistory } from './components/WeekHistory';

const App: React.FC = () => {
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const { user, loading } = useAuth();
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [dbError, setDbError] = useState(false);

  useEffect(() => {
    if (!db) {
      console.error("Firebase DB não foi inicializado. A aplicação não pode carregar os dados.");
      setDbError(true);
      return;
    }

    // FIX: Switched to v8 syntax for database references and listeners.
    const playersRef = db.ref('players');
    const playersListener = playersRef.on('value', (snapshot) => {
      const data = snapshot.val();
      const playersArray: PlayerData[] = [];
      if (data) {
        Object.keys(data).forEach(key => {
          playersArray.push({
            ...data[key],
            id: key, 
          });
        });
      }
      setPlayers(playersArray);
    }, (error) => {
      console.error("Erro ao ler jogadores do Firebase:", error);
      setDbError(true);
    });

    const weeksRef = db.ref('weeks');
    const weeksListener = weeksRef.on('value', (snapshot) => {
      const data = snapshot.val();
      const weeksArray: Week[] = [];
       if (data) {
        Object.keys(data).forEach(key => {
          weeksArray.push({
            ...data[key],
            id: key,
          });
        });
      }
      setWeeks(weeksArray);
    }, (error) => {
      console.error("Erro ao ler semanas do Firebase:", error);
      setDbError(true);
    });

    return () => {
      playersRef.off('value', playersListener);
      weeksRef.off('value', weeksListener);
    };
  }, []);

  const addPlayer = useCallback((name: string) => {
    if (name && !players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      const newPlayerData = {
        name,
        accumulatedValue: 0,
        totalPoints: 0,
        previousTotalPoints: 0,
        presence: 0,
        wins: 0,
        pointsToday: 0,
      };

      // FIX: Switched to v8 syntax for push and set.
      const newPlayerRef = db.ref('players').push();
      
      newPlayerRef.set(newPlayerData)
        .catch((error) => {
          console.error("Falha ao salvar jogador:", error);
          alert(`ERRO: Não foi possível adicionar o jogador. Verifique se você está logado e se as regras de segurança do seu banco de dados permitem escrita. Detalhes: ${error.message}`);
        });

    } else if (name) {
        alert("Já existe um jogador com este nome.");
    }
  }, [players]);

  const removePlayer = useCallback((id: string) => {
    if (window.confirm('Você tem certeza que deseja remover este jogador? Ele será removido de todos os históricos semanais.')) {
        // FIX: Switched to v8 syntax for remove.
        db.ref(`players/${id}`).remove();
        
        const updatedWeeks = weeks.map(week => ({
          ...week,
          results: week.results.filter(r => r.playerId !== id)
        })).filter(week => week.results.length > 0);

        const weeksObjectForFirebase = updatedWeeks.reduce((acc, week) => {
            acc[week.id] = { ...week, id: null }; // Remove o id do objeto antes de salvar
            return acc;
        }, {} as any);

        // FIX: Switched to v8 syntax for set.
        db.ref('weeks').set(weeksObjectForFirebase);
    }
  }, [weeks]);

  const updatePlayer = useCallback((playerId: string, updatedData: Partial<PlayerData>) => {
    // FIX: Switched to v8 syntax for update.
    db.ref(`players/${playerId}`).update(updatedData);
  }, []);

  const rankingPlayers = useMemo((): RankingPlayer[] => {
    const sortedPlayers = [...players].sort((a, b) => b.totalPoints - a.totalPoints);
    return sortedPlayers.map((player, index) => ({...player, rank: index + 1}));
  }, [players]);

  const handleWeekSubmit = useCallback((results: { playerId: string; rank: number }[], isDoubled: boolean, weekIdToUpdate?: string) => {
    if (weekIdToUpdate) {
        alert("A semana foi atualizada no histórico. Lembre-se que os totais não são recalculados automaticamente. Se necessário, ajuste os valores na tabela manualmente.");
        const weekResults = results.map(({ playerId, rank }) => ({ playerId, rank }));
        db.ref(`weeks/${weekIdToUpdate}`).update({
          results: weekResults,
          isDoubled: isDoubled,
        });
        return;
    }

    const updates: Record<string, any> = {};
    const multiplier = isDoubled ? 2 : 1;
    const participatingPlayerIds = new Set(results.map(r => r.playerId));

    players.forEach(player => {
        const didParticipate = participatingPlayerIds.has(player.id);

        if (didParticipate) {
            const result = results.find(r => r.playerId === player.id)!;
            const placementPoints = (PLACEMENT_POINTS[result.rank - 1] || 1) * multiplier;
            const participationPoints = 20 * multiplier;
            const totalPointsForWeek = placementPoints + participationPoints;

            updates[`/players/${player.id}`] = {
                name: player.name,
                accumulatedValue: player.accumulatedValue,
                previousTotalPoints: player.totalPoints,
                totalPoints: player.totalPoints + totalPointsForWeek,
                pointsToday: totalPointsForWeek,
                presence: player.presence + 1,
                wins: result.rank === 1 ? player.wins + 1 : player.wins,
            };
        } else {
            // Se o jogador não participou, reseta os pontos do dia e atualiza a pontuação anterior.
            // Apenas envia a atualização se for necessário para evitar escritas desnecessárias no DB.
            if (player.pointsToday !== 0) {
                 updates[`/players/${player.id}`] = {
                    name: player.name,
                    accumulatedValue: player.accumulatedValue,
                    totalPoints: player.totalPoints,
                    previousTotalPoints: player.totalPoints,
                    presence: player.presence,
                    wins: player.wins,
                    pointsToday: 0,
                };
            }
        }
    });

    const newWeekRef = db.ref('weeks').push();
    const newWeekId = newWeekRef.key;
    if (!newWeekId) {
      console.error("Não foi possível gerar ID para a nova semana.");
      return;
    }

    const newWeek: Omit<Week, 'id'> = {
        date: new Date().toISOString(),
        results: results.map(({ playerId, rank }) => ({ playerId, rank })),
        isDoubled: isDoubled,
    };
    updates[`/weeks/${newWeekId}`] = newWeek;

    db.ref().update(updates);
  }, [players]);

  const handleDeleteWeek = useCallback((weekId: string) => {
    if (window.confirm('Excluir esta semana do histórico não atualizará os totais. Você precisará ajustar a tabela manually. Deseja continuar?')) {
        db.ref(`weeks/${weekId}`).remove();
    }
  }, []);

  if (dbError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center p-8 bg-slate-800 rounded-lg shadow-xl max-w-lg mx-auto border border-red-500/30">
          <h1 className="text-2xl text-red-500 font-bold mb-4">Erro de Conexão com o Banco de Dados</h1>
          <p className="text-slate-300 mb-4">
            Não foi possível carregar os dados do ranking.
          </p>
          <p className="text-slate-400 mt-2 mb-6">
            Isso pode acontecer se o serviço estiver offline ou se houver um problema com as
            credenciais de acesso no arquivo <code>firebaseConfig.ts</code>.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Recarregar Página
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-xl text-slate-400">Carregando...</div>
      </div>
    );
  }

  if (user) {
    return (
      <AdminDashboard
        players={players}
        weeks={weeks}
        rankingPlayers={rankingPlayers}
        onAddPlayer={addPlayer}
        onRemovePlayer={removePlayer}
        onUpdatePlayer={updatePlayer}
        onWeekSubmit={handleWeekSubmit}
        onDeleteWeek={handleDeleteWeek}
      />
    );
  }

  if (isLoginVisible) {
    return <Login onCancel={() => setIsLoginVisible(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-700">
          <div className="text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Ranking Chicagos
            </h1>
            <p className="text-slate-400 mt-1">Acompanhe a classificação semanal dos jogadores.</p>
          </div>
          <button
            onClick={() => setIsLoginVisible(true)}
            className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Área do Admin
          </button>
        </header>
        <main>
          <div className="bg-slate-800/50 rounded-xl p-6 shadow-lg border border-slate-700">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Classificação Geral</h2>
            <RankingTable players={rankingPlayers} isAdmin={false} />
          </div>
          <WeekHistory 
            weeks={weeks}
            players={players}
            isAdmin={false}
          />
        </main>
      </div>
    </div>
  );
};

export default App;