-- Seed inicial de Jogadores Profissionais

-- CBLOL Players (LOUD)
INSERT INTO players (puuid, name, team_id, role, rank, profile_icon_id, country, real_name) VALUES
('loud-robson-puuid', 'Robson', (SELECT id FROM teams WHERE name = 'LOUD'), 'top', 'Challenger', 4568, 'BR', 'Robson Oliveira'),
('loud-croc-puuid', 'Croc', (SELECT id FROM teams WHERE name = 'LOUD'), 'jungle', 'Challenger', 4569, 'BR', 'Gabriel Jacinto'),
('loud-minari-puuid', 'Minari', (SELECT id FROM teams WHERE name = 'LOUD'), 'mid', 'Challenger', 4570, 'KR', 'Kim Min-su'),
('loud-route-puuid', 'Route', (SELECT id FROM teams WHERE name = 'LOUD'), 'adc', 'Challenger', 4571, 'BR', 'Matheus Alves'),
('loud-ceo-puuid', 'CeO', (SELECT id FROM teams WHERE name = 'LOUD'), 'support', 'Challenger', 4572, 'BR', 'Joao Costa');

-- CBLOL Players (paiN Gaming)
INSERT INTO players (puuid, name, team_id, role, rank, profile_icon_id, country, real_name) VALUES
('pain-guinsoo-puuid', 'Guinsoo', (SELECT id FROM teams WHERE name = 'paiN Gaming'), 'top', 'Challenger', 4573, 'BR', 'Felipe Bittencourt'),
('pain-mylu-puuid', 'Mylu', (SELECT id FROM teams WHERE name = 'paiN Gaming'), 'jungle', 'Challenger', 4574, 'BR', 'Mateus Silva'),
('pain-dyogoo-puuid', 'Dyogoo', (SELECT id FROM teams WHERE name = 'paiN Gaming'), 'mid', 'Challenger', 4575, 'BR', 'Diego Costa'),
('pain-brance-puuid', 'Brance', (SELECT id FROM teams WHERE name = 'paiN Gaming'), 'adc', 'Challenger', 4576, 'BR', 'Bruno Pereira'),
('pain-khori-puuid', 'Khori', (SELECT id FROM teams WHERE name = 'paiN Gaming'), 'support', 'Challenger', 4577, 'BR', 'Kaique Santos');

-- LCK Players (T1)
INSERT INTO players (puuid, name, team_id, role, rank, profile_icon_id, country, real_name) VALUES
('t1-zeus-puuid', 'Zeus', (SELECT id FROM teams WHERE name = 'T1'), 'top', 'Challenger', 4578, 'KR', 'Choi Woo-je'),
('t1-oner-puuid', 'Oner', (SELECT id FROM teams WHERE name = 'T1'), 'jungle', 'Challenger', 4579, 'KR', 'Moon Hyeon-joon'),
('t1-faker-puuid', 'Faker', (SELECT id FROM teams WHERE name = 'T1'), 'mid', 'Challenger', 4580, 'KR', 'Lee Sang-hyeok'),
('t1-gumayusi-puuid', 'Gumayusi', (SELECT id FROM teams WHERE name = 'T1'), 'adc', 'Challenger', 4581, 'KR', 'Lee Min-hyeong'),
('t1-keria-puuid', 'Keria', (SELECT id FROM teams WHERE name = 'T1'), 'support', 'Challenger', 4582, 'KR', 'Ryu Min-seok');

-- LCK Players (Gen.G)
INSERT INTO players (puuid, name, team_id, role, rank, profile_icon_id, country, real_name) VALUES
('geng-kiin-puuid', 'Kiin', (SELECT id FROM teams WHERE name = 'Gen.G'), 'top', 'Challenger', 4583, 'KR', 'Kim Gi-in'),
('geng-canyon-puuid', 'Canyon', (SELECT id FROM teams WHERE name = 'Gen.G'), 'jungle', 'Challenger', 4584, 'KR', 'Kim Geon-bu'),
('geng-chovy-puuid', 'Chovy', (SELECT id FROM teams WHERE name = 'Gen.G'), 'mid', 'Challenger', 4585, 'KR', 'Jeong Ji-hoon'),
('geng-peyz-puuid', 'Peyz', (SELECT id FROM teams WHERE name = 'Gen.G'), 'adc', 'Challenger', 4586, 'KR', 'Kim Su-hwan'),
('geng-lehends-puuid', 'Lehends', (SELECT id FROM teams WHERE name = 'Gen.G'), 'support', 'Challenger', 4587, 'KR', 'Son Si-woo');

-- LEC Players (G2 Esports)
INSERT INTO players (puuid, name, team_id, role, rank, profile_icon_id, country, real_name) VALUES
('g2-brokenblade-puuid', 'BrokenBlade', (SELECT id FROM teams WHERE name = 'G2 Esports'), 'top', 'Challenger', 4588, 'DE', 'Sergen Çelik'),
('g2-yike-puuid', 'Yike', (SELECT id FROM teams WHERE name = 'G2 Esports'), 'jungle', 'Challenger', 4589, 'PL', 'Martin Sundelin'),
('g2-caps-puuid', 'Caps', (SELECT id FROM teams WHERE name = 'G2 Esports'), 'mid', 'Challenger', 4590, 'DK', 'Rasmus Winther'),
('g2-hans-sama-puuid', 'Hans sama', (SELECT id FROM teams WHERE name = 'G2 Esports'), 'adc', 'Challenger', 4591, 'FR', 'Steven Liv'),
('g2-mikyx-puuid', 'Mikyx', (SELECT id FROM teams WHERE name = 'G2 Esports'), 'support', 'Challenger', 4592, 'SI', 'Mihael Mehle');

-- LEC Players (Fnatic)
INSERT INTO players (puuid, name, team_id, role, rank, profile_icon_id, country, real_name) VALUES
('fnc-oscarinin-puuid', 'Oscarinin', (SELECT id FROM teams WHERE name = 'Fnatic'), 'top', 'Challenger', 4593, 'ES', 'Oscar Muñoz'),
('fnc-razork-puuid', 'Razork', (SELECT id FROM teams WHERE name = 'Fnatic'), 'jungle', 'Challenger', 4594, 'ES', 'Iván Martín'),
('fnc-humanoid-puuid', 'Humanoid', (SELECT id FROM teams WHERE name = 'Fnatic'), 'mid', 'Challenger', 4595, 'CZ', 'Marek Brázda'),
('fnc-noah-puuid', 'Noah', (SELECT id FROM teams WHERE name = 'Fnatic'), 'adc', 'Challenger', 4596, 'KR', 'Oh Hyeon-taek'),
('fnc-jun-puuid', 'Jun', (SELECT id FROM teams WHERE name = 'Fnatic'), 'support', 'Challenger', 4597, 'KR', 'Yoon Se-jun');

-- LCS Players (Cloud9)
INSERT INTO players (puuid, name, team_id, role, rank, profile_icon_id, country, real_name) VALUES
('c9-thanatos-puuid', 'Thanatos', (SELECT id FROM teams WHERE name = 'Cloud9'), 'top', 'Challenger', 4598, 'GR', 'Dimitris Dimitriou'),
('c9-blaber-puuid', 'Blaber', (SELECT id FROM teams WHERE name = 'Cloud9'), 'jungle', 'Challenger', 4599, 'US', 'Robert Huang'),
('c9-jojopyun-puuid', 'Jojopyun', (SELECT id FROM teams WHERE name = 'Cloud9'), 'mid', 'Challenger', 4600, 'CA', 'Joseph Pyun'),
('c9-berserker-puuid', 'Berserker', (SELECT id FROM teams WHERE name = 'Cloud9'), 'adc', 'Challenger', 4601, 'KR', 'Kim Min-cheol'),
('c9-vulcan-puuid', 'Vulcan', (SELECT id FROM teams WHERE name = 'Cloud9'), 'support', 'Challenger', 4602, 'US', 'Philippe Laflamme');

-- LCS Players (Team Liquid)
INSERT INTO players (puuid, name, team_id, role, rank, profile_icon_id, country, real_name) VALUES
('tl-impact-puuid', 'Impact', (SELECT id FROM teams WHERE name = 'Team Liquid'), 'top', 'Challenger', 4603, 'KR', 'Jung Eon-yeong'),
('tl-umti-puuid', 'Umti', (SELECT id FROM teams WHERE name = 'Team Liquid'), 'jungle', 'Challenger', 4604, 'KR', 'Kim Se-jun'),
('tl-apa-puuid', 'APA', (SELECT id FROM teams WHERE name = 'Team Liquid'), 'mid', 'Challenger', 4605, 'US', 'Aaron Puchero'),
('tl-yeon-puuid', 'Yeon', (SELECT id FROM teams WHERE name = 'Team Liquid'), 'adc', 'Challenger', 4606, 'KR', 'Kim Yeon-jun'),
('tl-corejj-puuid', 'CoreJJ', (SELECT id FROM teams WHERE name = 'Team Liquid'), 'support', 'Challenger', 4607, 'KR', 'Jo Yong-in');

-- LPL Players (Bilibili Gaming)
INSERT INTO players (puuid, name, team_id, role, rank, profile_icon_id, country, real_name) VALUES
('blg-bin-puuid', 'Bin', (SELECT id FROM teams WHERE name = 'Bilibili Gaming'), 'top', 'Challenger', 4608, 'CN', 'Chen Ze-Bin'),
('blg-xun-puuid', 'Xun', (SELECT id FROM teams WHERE name = 'Bilibili Gaming'), 'jungle', 'Challenger', 4609, 'CN', 'Peng Li-Xun'),
('blg-knight-puuid', 'Knight', (SELECT id FROM teams WHERE name = 'Bilibili Gaming'), 'mid', 'Challenger', 4610, 'CN', 'Zhuo Ding'),
('blg-elk-puuid', 'Elk', (SELECT id FROM teams WHERE name = 'Bilibili Gaming'), 'adc', 'Challenger', 4611, 'CN', 'Zhao Jia-Hao'),
('blg-on-puuid', 'ON', (SELECT id FROM teams WHERE name = 'Bilibili Gaming'), 'support', 'Challenger', 4612, 'CN', 'Luo Wen-Jun');

-- LPL Players (JD Gaming)
INSERT INTO players (puuid, name, team_id, role, rank, profile_icon_id, country, real_name) VALUES
('jdg-369-puuid', '369', (SELECT id FROM teams WHERE name = 'JD Gaming'), 'top', 'Challenger', 4613, 'CN', 'Bai Jia-Hao'),
('jdg-kanavi-puuid', 'Kanavi', (SELECT id FROM teams WHERE name = 'JD Gaming'), 'jungle', 'Challenger', 4614, 'KR', 'Seo Jin-hyeok'),
('jdg-knight-puuid', 'Knight', (SELECT id FROM teams WHERE name = 'JD Gaming'), 'mid', 'Challenger', 4615, 'CN', 'Zhuo Ding'),
('jdg-ruler-puuid', 'Ruler', (SELECT id FROM teams WHERE name = 'JD Gaming'), 'adc', 'Challenger', 4616, 'KR', 'Park Jae-hyuk'),
('jdg-missing-puuid', 'Missing', (SELECT id FROM teams WHERE name = 'JD Gaming'), 'support', 'Challenger', 4617, 'CN', 'Lou Yun-Feng');
