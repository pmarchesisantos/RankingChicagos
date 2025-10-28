import type { RankingPlayer } from '../types';

declare const XLSX: any;

export const exportToExcel = (players: RankingPlayer[], fileName: string) => {
  if (typeof XLSX === 'undefined') {
    console.error("A biblioteca XLSX não está carregada. Verifique se o script está incluído no seu HTML.");
    alert("Não foi possível exportar para Excel. A biblioteca necessária está faltando.");
    return;
  }
  
  const dataToExport = players.map((player) => ({
    'Pos.': player.rank,
    'Nome': player.name,
    'Pontos Totais': player.totalPoints,
    'Última Pontuação': player.previousTotalPoints,
    'Presenças': player.presence,
    'Vitórias': player.wins,
    'Pontos no Dia': player.pointsToday,
    'Valor Acumulado': player.accumulatedValue,
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Classificações');

  // Ajusta o tamanho das colunas para melhor legibilidade
  const cols = [
    { wch: 8 },  // Pos.
    { wch: 25 }, // Nome
    { wch: 15 }, // Pontos Totais
    { wch: 18 }, // Última Pontuação
    { wch: 12 }, // Presenças
    { wch: 12 }, // Vitórias
    { wch: 15 }, // Pontos no Dia
    { wch: 18 }, // Valor Acumulado
  ];
  worksheet['!cols'] = cols;

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
