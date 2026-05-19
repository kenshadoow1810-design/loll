const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const { Readable } = require('stream');

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

const DOWNLOAD_DIR = path.join(__dirname, '../../downloads');

if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

async function downloadCSV(page, url, filename) {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

  // Configurar comportamento de download
  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: DOWNLOAD_DIR,
  });

  // Aguardar e clicar no link "Download This Table" pelo texto exato
  console.log(`Procurando botão "Download This Table" em ${url}...`);

  try {
    await page.waitForFunction(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links.find(link => link.textContent.trim() === 'Download This Table');
    }, { timeout: 15000 });

    // Clicar no elemento encontrado
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const target = links.find(link => link.textContent.trim() === 'Download This Table');
      if (target) target.click();
    });

    console.log(`✅ Clique acionado em "Download This Table" para ${url}`);

    // Aguardar o download ser completado
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Procurar o arquivo baixado mais recente
    const files = fs.readdirSync(DOWNLOAD_DIR)
      .filter(f => f.endsWith('.csv'))
      .map(f => ({ name: f, time: fs.statSync(path.join(DOWNLOAD_DIR, f)).mtime }));

    if (files.length > 0) {
      files.sort((a, b) => b.time - a.time);
      const latestFile = files[0].name;
      const newPath = path.join(DOWNLOAD_DIR, filename);

      // Renomear se necessário para manter o padrão
      if (latestFile !== filename) {
        fs.renameSync(path.join(DOWNLOAD_DIR, latestFile), newPath);
      }

      return newPath;
    }

    return null;
  } catch (error) {
    console.error(`❌ Erro ao encontrar/clicar no botão de download em ${url}:`, error.message);

    // Listar todos os links disponíveis para debug
    const allLinks = await page.$$eval('a', links => links.map(l => l.textContent.trim()));
    console.log('Links encontrados na página:', allLinks.filter(l => l.length > 0));

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
  console.log('Iniciando scrape de jogadores...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });

    const allPlayers = [];

    for (const league of LEAGUES) {
      console.log(`Processando liga: ${league.name}`);

      if (league.urls) {
        let leaguePlayers = [];
        for (let i = 0; i < league.urls.length; i++) {
          const url = league.urls[i];
          const filename = `players_${league.name.toLowerCase()}_${i}.csv`;
          console.log(`  Baixando URL ${i + 1}/${league.urls.length}: ${url}`);

          const filePath = await downloadCSV(page, url, filename);
          if (filePath && fs.existsSync(filePath)) {
            const players = await parseCSV(filePath);
            players.forEach(p => p.league = league.name);
            leaguePlayers = leaguePlayers.concat(players);
            console.log(`    ${players.length} jogadores extraídos`);
          }
        }

        const uniquePlayers = Array.from(new Map(leaguePlayers.map(p => [p.Player || p.player, p])).values());
        console.log(`  Total único para ${league.name}: ${uniquePlayers.length} jogadores`);
        allPlayers.push(...uniquePlayers);
      } else {
        const filename = `players_${league.name.toLowerCase()}.csv`;
        console.log(`  Baixando: ${league.url}`);

        const filePath = await downloadCSV(page, league.url, filename);
        if (filePath && fs.existsSync(filePath)) {
          const players = await parseCSV(filePath);
          players.forEach(p => p.league = league.name);
          allPlayers.push(...players);
          console.log(`    ${players.length} jogadores extraídos`);
        }
      }
    }

    console.log(`Total de jogadores extraídos: ${allPlayers.length}`);
    return allPlayers;
  } catch (error) {
    console.error('Erro no scrape de jogadores:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function scrapeTeams() {
  console.log('Iniciando scrape de times...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    const allTeams = [];

    for (const league of TEAMS_LEAGUES) {
      console.log(`Processando liga: ${league.name}`);

      if (league.urls) {
        let leagueTeams = [];
        for (let i = 0; i < league.urls.length; i++) {
          const url = league.urls[i];
          const filename = `teams_${league.name.toLowerCase()}_${i}.csv`;
          console.log(`  Baixando URL ${i + 1}/${league.urls.length}: ${url}`);

          const filePath = await downloadCSV(page, url, filename);
          if (filePath && fs.existsSync(filePath)) {
            const teams = await parseCSV(filePath);
            teams.forEach(t => t.league = league.name);
            leagueTeams = leagueTeams.concat(teams);
            console.log(`    ${teams.length} times extraídos`);
          }
        }

        // Consolidar dados de times com mesmo nome (somar estatísticas)
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
        console.log(`  Total consolidado para ${league.name}: ${consolidatedTeams.length} times`);
        allTeams.push(...consolidatedTeams);
      } else {
        const filename = `teams_${league.name.toLowerCase()}.csv`;
        console.log(`  Baixando: ${league.url}`);

        const filePath = await downloadCSV(page, league.url, filename);
        if (filePath && fs.existsSync(filePath)) {
          const teams = await parseCSV(filePath);
          teams.forEach(t => t.league = league.name);
          allTeams.push(...teams);
          console.log(`    ${teams.length} times extraídos`);
        }
      }
    }

    console.log(`Total de times extraídos: ${allTeams.length}`);
    return allTeams;
  } catch (error) {
    console.error('Erro no scrape de times:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = { scrapePlayers, scrapeTeams };
