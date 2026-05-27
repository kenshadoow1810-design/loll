const pool = require('../config/database');
const axios = require('axios');

async function updateChampionIcons() {
  console.log('Starting champion icon update process...');

  try {
    const versionsRes = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
    const latestVersion = versionsRes.data[0];
    console.log(`Data Dragon Version: ${latestVersion}`);

    const championsRes = await axios.get(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`);
    const championData = championsRes.data.data;

    const championMap = {};
    for (const key in championData) {
      const champ = championData[key];
      const normalizedName = champ.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const imageUrl = `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${key}.png`;
      
      championMap[normalizedName] = imageUrl;
      championMap[key.toLowerCase().replace(/[^a-z0-9]/g, '')] = imageUrl;
    }

    const query = `SELECT id, champion_name, role, league FROM champion_stats WHERE icon_url IS NULL OR icon_url = ''`;
    const result = await pool.query(query);
    
    if (result.rows.length === 0) {
      console.log(' All champions already have icons.');
      return;
    }

    console.log(` Found ${result.rows.length} champions without icons.`);

    let updatedCount = 0;

    for (const row of result.rows) {
      const dbNormalizedName = row.champion_name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const imageUrl = championMap[dbNormalizedName];

      if (imageUrl) {
        const updateQuery = `UPDATE champion_stats SET icon_url = $1 WHERE id = $2`;
        await pool.query(updateQuery, [imageUrl, row.id]);
        updatedCount++;
        console.log(`Updated: ${row.champion_name} (${row.role} - ${row.league})`);
      } else {
        console.log(`Icon not found for: ${row.champion_name}`);
      }
    }

    console.log(`Process finished! ${updatedCount} icons updated.`);

  } catch (error) {
    console.error('Error updating icons:', error.message);
    throw error;
  }
}

if (require.main === module) {
  updateChampionIcons()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { updateChampionIcons };
