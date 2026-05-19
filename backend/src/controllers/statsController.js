const pool = require('../config/database');

const getTeams = async (req, res) => {
  try {
    const { league } = req.params;
    
    let query;
    let values;
    
    if (league) {
      query = 'SELECT * FROM teams WHERE league = $1 ORDER BY wins DESC';
      values = [league];
    } else {
      query = 'SELECT * FROM teams ORDER BY league, wins DESC';
      values = [];
    }
    
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar times:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getPlayers = async (req, res) => {
  try {
    const { league } = req.params;
    const { position } = req.query;
    
    let query = 'SELECT * FROM players WHERE 1=1';
    const values = [];
    let paramCount = 1;
    
    if (league) {
      query += ` AND league = $${paramCount}`;
      values.push(league);
      paramCount++;
    }
    
    if (position) {
      query += ` AND position = $${paramCount}`;
      values.push(position);
      paramCount++;
    }
    
    query += ' ORDER BY kda DESC';
    
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar jogadores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getPlayerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'SELECT * FROM players WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Jogador não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar jogador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = { getTeams, getPlayers, getPlayerById };
