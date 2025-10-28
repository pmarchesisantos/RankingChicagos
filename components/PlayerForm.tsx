import React, { useState } from 'react';
import { UserPlusIcon } from './icons/UserPlusIcon';

interface PlayerFormProps {
  onAddPlayer: (name: string) => void;
}

export const PlayerForm: React.FC<PlayerFormProps> = ({ onAddPlayer }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddPlayer(name.trim());
      setName('');
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 shadow-lg border border-slate-700">
      <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Adicionar Novo Jogador</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label htmlFor="playerName" className="sr-only">Nome do Jogador</label>
        <input
          id="playerName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Digite o nome do jogador"
          className="bg-slate-700 border-2 border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:scale-105 transform transition-transform duration-300 flex items-center justify-center"
        >
          <UserPlusIcon className="h-6 w-6 mr-2" />
          Adicionar Jogador
        </button>
      </form>
    </div>
  );
};