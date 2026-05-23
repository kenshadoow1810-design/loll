const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const { Readable } = require('stream');
const https = require('https');
const axios = require('axios');

const LEAGUES = [
  { name: 'LCS', url: 'https://oracleselixir.com/stats/players/byTournament/LCS%2F2026%20Season%2FSpring%20Season' },
  { name: 'LCK', url: 'https://oracleselixir.com/stats/players/byTournament/LCK%2F2026%20Season%2FRounds%201-2' },
  { name: 'LEC', url: 'https://oracleselixir.com/stats/players/byTournament/LEC%2F2026%20Season%2FSpring%20Season' },
  { name: 'LPL', url: 'https://oracleselixir.com/stats/players/byTournament/LPL%2F2026%20Season%2FSplit%202' },
  { name: 'CBLOL', urls: [
    'https://oracleselixir.com/stats/players/byTournament/CBLOL%2F2026%20Season%2FSplit%201',
    'https://oracleselixir.com/stats/players/byTournament/CBLOL%2F2026%20Season%2FSplit%201%20Playoffs'
  ]}
];

const TEAMS_LEAGUES = [
  { name: 'LCS', url: 'https://oracleselixir.com/stats/teams/byTournament/LCS%2F2026%20Season%2FSpring%20Season' },
  { name: 'LCK', url: 'https://oracleselixir.com/stats/teams/byTournament/LCK%2F2026%20Season%2FRounds%201-2' },
  { name: 'LEC', url: 'https://oracleselixir.com/stats/teams/byTournament/LEC%2F2026%20Season%2FSpring%20Season' },
  { name: 'LPL', url: 'https://oracleselixir.com/stats/teams/byTournament/LPL%2F2026%20Season%2FSplit%202' },
  { name: 'CBLOL', urls: [
    'https://oracleselixir.com/stats/teams/byTournament/CBLOL%2F2026%20Season%2FSplit%201',
    'https://oracleselixir.com/stats/teams/byTournament/CBLOL%2F2026%20Season%2FSplit%201%20Playoffs'
  ]}
];

const CHAMPIONS_LEAGUES = [
  { name: 'LCS', url: 'https://oracleselixir.com/stats/champions/byTournament/LCS%2F2026%20Season%2FSpring%20Season' },
  { name: 'LCK', url: 'https://oracleselixir.com/stats/champions/byTournament/LCK%2F2026%20Season%2FRounds%201-2' },
  { name: 'LEC', url: 'https://oracleselixir.com/stats/champions/byTournament/LEC%2F2026%20Season%2FSpring%20Season' },
  { name: 'LPL', url: 'https://oracleselixir.com/stats/champions/byTournament/LPL%2F2026%20Season%2FSplit%202' },
  { name: 'CBLOL', urls: [
    'https://oracleselixir.com/stats/champions/byTournament/CBLOL%2F2026%20Season%2FSplit%201',
    'https://oracleselixir.com/stats/champions/byTournament/CBLOL%2F2026%20Season%2FSplit%201%20Playoffs'
  ]}
];

const DOWNLOAD_DIR = path.join(__dirname, '../../downloads');

if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

async function downloadCSV(page, url, filename) {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: DOWNLOAD_DIR,
  });

  try {
    await page.waitForFunction(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links.find(link => link.textContent.trim() === 'Download This Table');
    }, { timeout: 15000 });

    await new Promise(resolve => setTimeout(resolve, 5000));

    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const target = links.find(link => link.textContent.trim() === 'Download This Table');
      if (target) target.click();
    });

    await new Promise(resolve => setTimeout(resolve, 3000));

    const files = fs.readdirSync(DOWNLOAD_DIR)
      .filter(f => f.endsWith('.csv'))
      .map(f => ({ name: f, time: fs.statSync(path.join(DOWNLOAD_DIR, f)).mtime }));

    if (files.length > 0) {
      files.sort((a, b) => b.time - a.time);
      const latestFile = files[0].name;
      const newPath = path.join(DOWNLOAD_DIR, filename);

      if (latestFile !== filename) {
        fs.renameSync(path.join(DOWNLOAD_DIR, latestFile), newPath);
      }

      return newPath;
    }

    return null;
  } catch (error) {

    const allLinks = await page.$$eval('a', links => links.map(l => l.textContent.trim()));

    throw error;
  }
}

function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function scrapePlayers() {

  const browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
  ],
});

  try {
    const page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });

    const allPlayers = [];

    for (const league of LEAGUES) {

      if (league.urls) {
        let leaguePlayers = [];
        const playerStatsMap = new Map();
        for (let i = 0; i < league.urls.length; i++) {
          const url = league.urls[i];
          const filename = `players_${league.name.toLowerCase()}_${i}.csv`;

          const filePath = await downloadCSV(page, url, filename);
          if (filePath && fs.existsSync(filePath)) {
            const players = await parseCSV(filePath);
            players.forEach(p => p.league = league.name);


            for (const player of players) {
              const playerName = player.Player || player.player || 'Unknown';
              if (playerStatsMap.has(playerName)) {
                const existingPlayer = playerStatsMap.get(playerName);
                const gamesKey = Object.keys(player).find(k => k.toLowerCase().includes('games') || k.toLowerCase() === 'gp');
                const winsKey = Object.keys(player).find(k => k.toLowerCase().includes('win') && !k.toLowerCase().includes('percentage'));

                existingPlayer[gamesKey] = String((parseInt(existingPlayer[gamesKey]) || 0) + (parseInt(player[gamesKey]) || 0));
                existingPlayer[winsKey] = String((parseInt(existingPlayer[winsKey]) || 0) + (parseInt(player[winsKey]) || 0));
              } else {
                playerStatsMap.set(playerName, { ...player });
              }
            }

          }
        }

        const uniquePlayers = Array.from(playerStatsMap.values());

        allPlayers.push(...uniquePlayers);
      } else {
        const filename = `players_${league.name.toLowerCase()}.csv`;

        const filePath = await downloadCSV(page, league.url, filename);
        if (filePath && fs.existsSync(filePath)) {
          const players = await parseCSV(filePath);
          players.forEach(p => p.league = league.name);
          allPlayers.push(...players);

        }
      }
    }

    return allPlayers;
  } catch (error) {

    throw error;
  } finally {
    await browser.close();
  }
}

async function scrapeTeams() {

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    const allTeams = [];

    for (const league of TEAMS_LEAGUES) {

      if (league.urls) {
        let leagueTeams = [];
        for (let i = 0; i < league.urls.length; i++) {
          const url = league.urls[i];
          const filename = `teams_${league.name.toLowerCase()}_${i}.csv`;

          const filePath = await downloadCSV(page, url, filename);
          if (filePath && fs.existsSync(filePath)) {
            const teams = await parseCSV(filePath);
            teams.forEach(t => t.league = league.name);
            leagueTeams = leagueTeams.concat(teams);

          }
        }

        const teamMap = new Map();
        for (const team of leagueTeams) {
          const teamName = team.Team || team.team;
          if (teamMap.has(teamName)) {
            const existingTeam = teamMap.get(teamName);
            existingTeam.games_played = (parseInt(existingTeam.games_played) || 0) + (parseInt(team.games_played) || 0);
            existingTeam.wins = (parseInt(existingTeam.wins) || 0) + (parseInt(team.wins) || 0);
            existingTeam.losses = (parseInt(existingTeam.losses) || 0) + (parseInt(team.losses) || 0);
          } else {
            teamMap.set(teamName, { ...team });
          }
        }
        const consolidatedTeams = Array.from(teamMap.values());

        allTeams.push(...consolidatedTeams);
      } else {
        const filename = `teams_${league.name.toLowerCase()}.csv`;

        const filePath = await downloadCSV(page, league.url, filename);
        if (filePath && fs.existsSync(filePath)) {
          const teams = await parseCSV(filePath);
          teams.forEach(t => t.league = league.name);
          allTeams.push(...teams);

        }
      }
    }

    return allTeams;
  } catch (error) {

    throw error;
  } finally {
    await browser.close();
  }
}

async function scrapeChampions() {

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    const allChampions = [];

    for (const league of CHAMPIONS_LEAGUES) {

      if (league.urls) {
        let leagueChampions = [];
        for (let i = 0; i < league.urls.length; i++) {
          const url = league.urls[i];
          const filename = `champions_${league.name.toLowerCase()}_${i}.csv`;

          const filePath = await downloadCSV(page, url, filename);
          if (filePath && fs.existsSync(filePath)) {

            const stats = fs.statSync(filePath);
            if (stats.size === 0) {

              await new Promise(resolve => setTimeout(resolve, 2000));
              const retryPath = await downloadCSV(page, url, filename);
              if (retryPath && fs.existsSync(retryPath)) {
                const retryStats = fs.statSync(retryPath);
                if (retryStats.size === 0) {

                  continue;
                }
              } else {

                continue;
              }
            }

            const champions = await parseCSV(filePath);
            champions.forEach(c => c.league = league.name);
            leagueChampions = leagueChampions.concat(champions);

          } else {

          }
        }

        const champMap = new Map();
        for (const champ of leagueChampions) {
          const keys = Object.keys(champ);
          const findKey = (patterns) => keys.find(k => patterns.some(p => k.toLowerCase() === p.toLowerCase()));

          const champName = champ[findKey(['champion', 'champ', 'name'])] || 'Unknown';
          const role = (champ[findKey(['role', 'lane', 'pos'])] || 'UNKNOWN').toUpperCase();
          const iconKey = findKey(['icon', 'image', 'url']);
          const key = `${champName}-${role}`;

          if (champMap.has(key)) {
            const existingChamp = champMap.get(key);
            const gamesKey = findKey(['games', 'gp', 'games played']);
            const winsKey = findKey(['wins', 'w']);
            const bansKey = findKey(['bans']);
            const killsKey = findKey(['kills', 'k']);
            const deathsKey = findKey(['deaths', 'd']);
            const assistsKey = findKey(['assists', 'a']);


            existingChamp[gamesKey] = String((parseInt(existingChamp[gamesKey]) || 0) + (parseInt(champ[gamesKey]) || 0));
            existingChamp[winsKey] = String((parseInt(existingChamp[winsKey]) || 0) + (parseInt(champ[winsKey]) || 0));
            existingChamp[bansKey] = String((parseInt(existingChamp[bansKey]) || 0) + (parseInt(champ[bansKey]) || 0));
            existingChamp[killsKey] = String((parseInt(existingChamp[killsKey]) || 0) + (parseInt(champ[killsKey]) || 0));
            existingChamp[deathsKey] = String((parseInt(existingChamp[deathsKey]) || 0) + (parseInt(champ[deathsKey]) || 0));
            existingChamp[assistsKey] = String((parseInt(existingChamp[assistsKey]) || 0) + (parseInt(champ[assistsKey]) || 0));


            if (!existingChamp[iconKey] && champ[iconKey]) {
              existingChamp[iconKey] = champ[iconKey];
            }
          } else {
            champMap.set(key, { ...champ });
          }
        }
        const consolidatedChampions = Array.from(champMap.values());

        allChampions.push(...consolidatedChampions);
      } else {
        const filename = `champions_${league.name.toLowerCase()}.csv`;

        const filePath = await downloadCSV(page, league.url, filename);
        if (filePath && fs.existsSync(filePath)) {

          const stats = fs.statSync(filePath);
          if (stats.size === 0) {

            await new Promise(resolve => setTimeout(resolve, 2000));
            const retryPath = await downloadCSV(page, league.url, filename);
            if (retryPath && fs.existsSync(retryPath)) {
              const retryStats = fs.statSync(retryPath);
              if (retryStats.size === 0) {

                continue;
              }
            } else {

              continue;
            }
          }

          const champions = await parseCSV(filePath);
          champions.forEach(c => c.league = league.name);
          allChampions.push(...champions);

        } else {

        }
      }
    }

    // Fetch images from standard API
    const championImages = await fetchChampionImages();

    // Fetch CBLOL-specific images separately
    const cblolChampionImages = await fetchCBLOLChampionImages();

    const championsWithImages = allChampions.map(champ => {
      const keys = Object.keys(champ);
      const findKey = (patterns) => keys.find(k => patterns.some(p => k.toLowerCase() === p.toLowerCase()));
      const iconKey = findKey(['icon', 'image', 'url']);
      const champName = champ[findKey(['champion', 'champ', 'name'])] || '';
      const league = champ.league || '';

      // If already has an icon_url, keep it
      if (champ[iconKey] && champ[iconKey].trim() !== '') {
        return champ;
      }

      // For CBLOL champions, use the CBLOL-specific image fetcher first
      if (league === 'CBLOL') {
        const formattedName = formatChampionName(champName);
        const cblolImageUrl = cblolChampionImages[formattedName];

        if (cblolImageUrl) {
          return { ...champ, [iconKey || 'icon_url']: cblolImageUrl };
        }
      }

      // Fallback to standard champion images
      const formattedName = formatChampionName(champName);
      const imageUrl = championImages[formattedName] || null;

      if (imageUrl) {
        return { ...champ, [iconKey || 'icon_url']: imageUrl };
      }

      return champ;
    });

    return championsWithImages;
  } catch (error) {

    throw error;
  } finally {
    await browser.close();
  }
}

async function fetchChampionImages() {
  try {
    const response = await axios.get('https://ddragon.leagueoflegends.com/cdn/16.1.1/data/en_US/champion.json');
    const championData = response.data.data;

    const imageMap = {};
    for (const [key, champion] of Object.entries(championData)) {
      imageMap[key.toUpperCase()] = `https://ddragon.leagueoflegends.com/cdn/16.1.1/img/champion/${key}.png`;

      const formattedName = formatChampionName(champion.name);
      if (formattedName !== key.toUpperCase()) {
        imageMap[formattedName] = `https://ddragon.leagueoflegends.com/cdn/16.1.1/img/champion/${key}.png`;
      }
    }

    return imageMap;
  } catch (error) {
    return {};
  }
}

async function fetchCBLOLChampionImages() {
  try {
    // Fetch the latest version dynamically or use a fixed version
    const versionResponse = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions = versionResponse.data;
    const latestVersion = versions[0] || '16.1.1';

    const response = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/pt_BR/champion.json`);
    const championData = response.data.data;

    const imageMap = {};
    for (const [key, champion] of Object.entries(championData)) {
      // Use Portuguese-Brazilian data but same image URLs
      imageMap[key.toUpperCase()] = `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${key}.png`;

      const formattedName = formatChampionName(champion.name);
      if (formattedName !== key.toUpperCase()) {
        imageMap[formattedName] = `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${key}.png`;
      }

      // Also map using the Portuguese name variations
      const ptBRFormattedName = formatChampionName(champion.title || champion.name);
      if (ptBRFormattedName && ptBRFormattedName !== key.toUpperCase()) {
        imageMap[ptBRFormattedName] = `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${key}.png`;
      }
    }

    return imageMap;
  } catch (error) {
    return {};
  }
}

function formatChampionName(name) {
  if (!name) return '';
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();
}

module.exports = { scrapePlayers, scrapeTeams, scrapeChampions };
