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
  };
}

export function generateMatch(player) {
  const champ = CHAMPIONS[rand(0, CHAMPIONS.length - 1)];
  const win = Math.random() > 0.4;
  const k = rand(1, 14), d = rand(0, 8), a = rand(2, 20);
  const minutesAgo = rand(1, 720);
  return {
    id: `match-${Math.random().toString(36).substr(2, 8)}`,
    player: player.name,
    playerId: player.id,
    champion: champ,
    kills: k, deaths: d, assists: a,
    win,
    cs: rand(120, 380),
    damage: rand(8000, 45000),
    gold: rand(8000, 22000),
    timeAgo: minutesAgo,
    duration: rand(22, 48),
    league: player.league,
  };
}

export const NEWS = [
  { title: 'T1 domina LCK com campanha perfeita na etapa regular', source: 'Liquipedia', date: 'há 2h', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=340&fit=crop', summary: 'A equipe de Faker continua imbatível na LCK 2026, com 18 vitórias consecutivas e um KDA coletivo impressionante.' },
  { title: 'CBLOL 2026: LOUD anuncia nova formação estelar', source: 'CBLOL.gg', date: 'há 5h', img: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=340&fit=crop', summary: 'A LOUD revelou sua nova roster para a split de verão, com mudanças que prometem agitar o cenário brasileiro.' },
  { title: 'Patch 14.10 traz mudanças drásticas no meta de ADC', source: 'Riot Games', date: 'há 8h', img: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&h=340&fit=crop', summary: 'A Riot anunciou alterações significativas em itens e campeões de atirador, o que deve impactar diretamente o cenário competitivo.' },
  { title: 'G2 Esports vence LEC Spring Split com performance histórica', source: 'LEC.gg', date: 'há 12h', img: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=600&h=340&fit=crop', summary: 'Caps e companhia dominaram a final contra Fnatic com uma série 3-0 convincente, garantindo vaga no MSI.' },
  { title: 'Cloud9 surpreende LCS com estratégia inovadora de draft', source: 'LCS.gg', date: 'há 1 dia', img: 'https://images.unsplash.com/photo-1542751110-974271209649?w=600&h=340&fit=crop', summary: 'A C9 vem utilizando composições atípicas que estão confundindo os analistas e derrotando os favoritos.' },
  { title: 'JDG confirma presença no Worlds 2026 com campanha dominante', source: 'LPL.cn', date: 'há 1 dia', img: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=600&h=340&fit=crop', summary: 'A equipe chinesa JD Gaming garantiu sua vaga no mundial com uma das melhores campanhas da história da LPL.' },
];

// Generate data
export const PLAYERS = {};
Object.keys(TEAMS).forEach(league => {
  PLAYERS[league] = Array.from({ length: 15 }, (_, i) => generatePlayer(league, i));
  PLAYERS[league].sort((a, b) => b.kda - a.kda);
});

export const MATCHES = {};
Object.keys(PLAYERS).forEach(league => {
  MATCHES[league] = PLAYERS[league].slice(0, 5).flatMap(p =>
    Array.from({ length: 5 }, () => generateMatch(p))
  );
  MATCHES[league].sort((a, b) => b.timeAgo - a.timeAgo);
});

export const getAllPlayers = () => Object.values(PLAYERS).flat();
export const getAllMatches = () => Object.values(MATCHES).flat();
export const getTopPlayers = (count = 8) => getAllPlayers().sort((a, b) => b.kda - a.kda).slice(0, count);
export const getPlayerById = (playerId, league) => PLAYERS[league]?.find(p => p.id === playerId);
