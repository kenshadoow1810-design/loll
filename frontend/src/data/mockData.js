/* eslint-disable no-unused-vars */
import React from 'react';

export const TEAMS = {
  CBLOL: [
    { id: 1, name: 'LOUD', logo: '🔊', region: 'BR' },
    { id: 2, name: 'paiN Gaming', logo: '🎯', region: 'BR' },
    { id: 3, name: 'FURIA', logo: '🐾', region: 'BR' },
    { id: 4, name: 'INTZ', logo: '🔴', region: 'BR' },
    { id: 5, name: 'Fluxo', logo: '⚡', region: 'BR' },
    { id: 6, name: 'RED Canids', logo: '🔺', region: 'BR' },
    { id: 7, name: 'KaBuM!', logo: '💥', region: 'BR' },
    { id: 8, name: 'LOS', logo: '🦁', region: 'BR' },
  ],
  LCK: [
    { id: 10, name: 'T1', logo: '🏆', region: 'KR' },
    { id: 11, name: 'Gen.G', logo: '🟡', region: 'KR' },
    { id: 12, name: 'DRX', logo: '🐉', region: 'KR' },
    { id: 13, name: 'Hanwha Life Esports', logo: '🦅', region: 'KR' },
    { id: 14, name: 'Dplus KIA', logo: '🚗', region: 'KR' },
  ],
  LEC: [
    { id: 20, name: 'G2 Esports', logo: '🎮', region: 'EU' },
    { id: 21, name: 'Fnatic', logo: '🟠', region: 'EU' },
    { id: 22, name: 'MAD Lions', logo: '🦁', region: 'EU' },
    { id: 23, name: 'Team BDS', logo: '🔵', region: 'EU' },
  ],
  LCS: [
    { id: 30, name: 'Cloud9', logo: '☁️', region: 'NA' },
    { id: 31, name: 'Team Liquid', logo: '🌊', region: 'NA' },
    { id: 32, name: '100 Thieves', logo: '💯', region: 'NA' },
  ],
  LPL: [
    { id: 40, name: 'JD Gaming', logo: '🔴', region: 'CN' },
    { id: 41, name: 'Bilibili Gaming', logo: '📺', region: 'CN' },
    { id: 42, name: 'EDward Gaming', logo: '👑', region: 'CN' },
    { id: 43, name: 'Top Esports', logo: '🔝', region: 'CN' },
  ]
};

export const CHAMPIONS = ['Azir', 'Orianna', 'Ahri', 'Zoe', 'Syndra', 'LeBlanc', 'Viktor', 'Akali', 'Sylas', 'Corki', 'Jayce', 'Gnar', 'Jax', 'Aatrox', 'Gwen', 'Renekton', 'Graves', 'Nidalee', 'Lee Sin', 'Kindred', 'Viego', 'Xin Zhao', 'Wukong', 'Sejuani', 'Jinx', 'Aphelios', 'Kai\'Sa', 'Zeri', 'Varus', 'Ezreal', 'Thresh', 'Nautilus', 'Rakan', 'Alistar', 'Leona', 'Braum', 'Renata', 'Lulu', 'Yuumi'];
export const ROLES = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randF = (min, max) => (Math.random() * (max - min) + min).toFixed(2);

export function generatePlayer(league, index) {
  const teams = TEAMS[league];
  const team = teams[index % teams.length];
  const role = ROLES[index % 5];
  const names = {
    CBLOL: ['Robo', 'Carioca', 'Grevthar', 'TitaN', 'Envy', 'Brance', 'Kuri', 'Tandercito', 'Ayala', 'Aegis', 'MicaO', 'Wizer', 'Goot', 'RedBert', 'RATO'],
    LCK: ['Faker', 'Chovy', 'Keria', 'Ruler', 'ShowMaker', 'Canyon', 'Doran', 'Peanut', 'Zeus', 'Oner', 'Gumayusi', 'Lehends', 'Pyosik', 'Deft', 'Bdd'],
    LEC: ['Caps', 'Yike', 'Hans Sama', 'Mikyx', 'BrokenBlade', 'Humanoid', 'Upset', 'Elyoya', 'Razork', 'Nisqy', 'Comp', 'Kaiser', 'Alvaro', 'Fresskowy', 'Vetheo'],
    LCS: ['Jensen', 'Berserker', 'Blaber', 'Fudge', 'CoreJJ', 'Spica', 'Impact', 'Tactical', 'Zven', 'Ssumday', 'Palafox', 'Armao', 'Busio', 'Ignar', 'huhi'],
    LPL: ['Knight', 'Elk', 'Kanavi', 'Rookie', 'Meiko', 'JackeyLove', 'Bin', 'Xun', 'Scout', 'Uzi', 'Wei', '369', 'Crisp', 'Tian', 'Ming']
  };
  const name = names[league][index % names[league].length];
  return {
    id: `${league}-${index}`,
    name,
    team: team.name,
    teamLogo: team.logo,
    league,
    role,
    region: team.region,
    kda: parseFloat(randF(2.5, 8.5)),
    kills: rand(2, 12),
    deaths: rand(0, 5),
    assists: rand(4, 16),
    csPerMin: parseFloat(randF(6.5, 11.2)),
    kp: rand(45, 85),
    wr: rand(45, 78),
    games: rand(15, 45),
    damage: rand(12000, 35000),
    gold: rand(8000, 18000),
    vision: parseFloat(randF(0.8, 3.2)),
    mostPlayedChamps: Array.from({ length: 5 }, (_, i) => ({
      champion: CHAMPIONS[rand(0, CHAMPIONS.length - 1)],
      games: rand(5, 25),
      wins: rand(3, 20),
    })),
  };
}

// Generate data
export const PLAYERS = {};
Object.keys(TEAMS).forEach(league => {
  PLAYERS[league] = Array.from({ length: 15 }, (_, i) => generatePlayer(league, i));
  PLAYERS[league].sort((a, b) => b.kda - a.kda);
});

export const getAllPlayers = () => Object.values(PLAYERS).flat();
export const getTopPlayers = (count = 8) => getAllPlayers().sort((a, b) => b.kda - a.kda).slice(0, count);
export const getPlayerById = (playerId, league) => PLAYERS[league]?.find(p => p.id === playerId);
