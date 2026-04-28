export const CLASS_LIST = [
  'Saber', 'Archer', 'Lancer', 'Rider', 'Caster', 'Assassin', 'Berserker',
  'Ruler', 'Avenger', 'Alterego', 'MoonCancer', 'Foreigner', 'Pretender',
  'Shielder', 'Beast'
];

export const CLASS_ADVANTAGE = {
  Saber:     {Saber:1,Archer:0.5,Lancer:2,Rider:1,Caster:1,Assassin:1,Berserker:2,Ruler:1,Avenger:1,Alterego:1,MoonCancer:1,Foreigner:1,Pretender:1,Shielder:1,Beast:1},
  Archer:    {Saber:2,Archer:1,Lancer:0.5,Rider:1,Caster:1,Assassin:1,Berserker:2,Ruler:1,Avenger:1,Alterego:1,MoonCancer:1,Foreigner:1,Pretender:1,Shielder:1,Beast:1},
  Lancer:    {Saber:0.5,Archer:2,Lancer:1,Rider:1,Caster:1,Assassin:1,Berserker:2,Ruler:1,Avenger:1,Alterego:1,MoonCancer:1,Foreigner:1,Pretender:1,Shielder:1,Beast:1},
  Rider:     {Saber:1,Archer:1,Lancer:1,Rider:1,Caster:2,Assassin:0.5,Berserker:2,Ruler:1,Avenger:1,Alterego:1,MoonCancer:1,Foreigner:1,Pretender:1,Shielder:1,Beast:1},
  Caster:    {Saber:1,Archer:1,Lancer:1,Rider:0.5,Caster:1,Assassin:2,Berserker:2,Ruler:1,Avenger:1,Alterego:1,MoonCancer:1,Foreigner:1,Pretender:1,Shielder:1,Beast:1},
  Assassin:  {Saber:1,Archer:1,Lancer:1,Rider:2,Caster:0.5,Assassin:1,Berserker:2,Ruler:1,Avenger:1,Alterego:1,MoonCancer:1,Foreigner:1,Pretender:1,Shielder:1,Beast:1},
  Berserker: {Saber:1.5,Archer:1.5,Lancer:1.5,Rider:1.5,Caster:1.5,Assassin:1.5,Berserker:1.5,Ruler:1.5,Avenger:1.5,Alterego:1.5,MoonCancer:1.5,Foreigner:1.5,Pretender:1.5,Shielder:1,Beast:1.5},
  Ruler:     {Saber:1,Archer:1,Lancer:1,Rider:1,Caster:1,Assassin:1,Berserker:2,Ruler:1,Avenger:1,Alterego:1,MoonCancer:2,Foreigner:1,Pretender:1,Shielder:1,Beast:1},
  Avenger:   {Saber:1,Archer:1,Lancer:1,Rider:1,Caster:1,Assassin:1,Berserker:2,Ruler:2,Avenger:1,Alterego:1,MoonCancer:0.5,Foreigner:1,Pretender:1,Shielder:1,Beast:1},
  Alterego:  {Saber:0.5,Archer:0.5,Lancer:0.5,Rider:1.5,Caster:1.5,Assassin:1.5,Berserker:2,Ruler:1,Avenger:1,Alterego:1,MoonCancer:1,Foreigner:2,Pretender:1,Shielder:1,Beast:1},
  MoonCancer:{Saber:1,Archer:1,Lancer:1,Rider:1,Caster:1,Assassin:1,Berserker:2,Ruler:0.5,Avenger:2,Alterego:1,MoonCancer:1,Foreigner:1,Pretender:1,Shielder:1,Beast:1},
  Foreigner: {Saber:1,Archer:1,Lancer:1,Rider:1,Caster:1,Assassin:1,Berserker:2,Ruler:1,Avenger:1,Alterego:2,MoonCancer:1,Foreigner:1,Pretender:1,Shielder:1,Beast:1},
  Pretender: {Saber:1.5,Archer:1.5,Lancer:1.5,Rider:1,Caster:1,Assassin:1,Berserker:2,Ruler:1,Avenger:1,Alterego:1,MoonCancer:1,Foreigner:1,Pretender:1,Shielder:1,Beast:1},
  Shielder:  {Saber:1,Archer:1,Lancer:1,Rider:1,Caster:1,Assassin:1,Berserker:1,Ruler:1,Avenger:1,Alterego:1,MoonCancer:1,Foreigner:1,Pretender:1,Shielder:1,Beast:1},
  Beast:     {Saber:1,Archer:1,Lancer:1,Rider:1,Caster:1,Assassin:1,Berserker:1,Ruler:1,Avenger:1,Alterego:1,MoonCancer:1,Foreigner:1,Pretender:1,Shielder:1,Beast:1}
};

export const CLASS_CORRECTION = {
  Saber:1, Archer:0.95, Lancer:1.05, Rider:1, Caster:0.9, Assassin:0.9,
  Berserker:1.1, Ruler:1.1, Avenger:1.1, Alterego:1, MoonCancer:1,
  Foreigner:1, Pretender:1, Shielder:1, Beast:1
};

export const ATTRIBUTE_LIST = ['Human', 'Sky', 'Earth', 'Star', 'Beast'];

export const ATTRIBUTE_MATRIX = {
  Human: {Human:1, Sky:1, Earth:0.9, Star:1, Beast:1},
  Sky:   {Human:1, Sky:1, Earth:1.1, Star:0.9, Beast:1},
  Earth: {Human:1.1, Sky:0.9, Earth:1, Star:1, Beast:1},
  Star:  {Human:1, Sky:1.1, Earth:1, Star:1, Beast:1.1},
  Beast: {Human:1, Sky:1, Earth:1, Star:1.1, Beast:1}
};

export const NP_COLOR_CARD_MULT = { Buster: 1.5, Arts: 1.0, Quick: 0.8 };

export const ENEMY_NP_MOD = {
  Saber:1, Archer:0.95, Lancer:1, Rider:1.1, Caster:1.2,
  Assassin:0.9, Berserker:0.8, Ruler:1, Avenger:1, Alterego:1,
  MoonCancer:1, Foreigner:1, Pretender:1, Shielder:1, Beast:1
};

export const CLASS_COLORS = {
  Saber:'#4a90d9', Archer:'#f5a623', Lancer:'#4a90d9', Rider:'#7ed321',
  Caster:'#9013fe', Assassin:'#d0021b', Berserker:'#d0021b', Ruler:'#f8e71c',
  Avenger:'#bd0fe1', Alterego:'#f5a623', MoonCancer:'#50e3c2', Foreigner:'#50e3c2',
  Pretender:'#f5a623', Shielder:'#7ed321', Beast:'#d0021b'
};

export const MAIN_CLASSES = ['Saber','Archer','Lancer','Rider','Caster','Assassin','Berserker'];
export const EXTRA_CLASSES = ['Ruler','Avenger','Alterego','MoonCancer','Foreigner','Pretender','Shielder','Beast'];
