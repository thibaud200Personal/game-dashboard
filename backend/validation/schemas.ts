import { z } from 'zod';

// Game-related schemas
export const GameTypeSchema = z.enum(['competitive', 'cooperative', 'campaign', 'hybrid']);
export const SessionTypeSchema = z.enum(['competitive', 'cooperative', 'campaign', 'hybrid']);

// Player schemas
export const CreatePlayerSchema = z.object({
  player_name: z.string().min(1, 'Le nom du joueur est requis').max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  pseudo: z.string().min(1, 'Le pseudo est requis').max(50, 'Le pseudo ne peut pas dépasser 50 caractères').optional(),
  avatar: z.string().url('URL d\'avatar invalide').optional(),
  favorite_game: z.string().max(100, 'Le nom du jeu favori ne peut pas dépasser 100 caractères').optional()
});

export const UpdatePlayerSchema = z.object({
  player_name: z.string().min(1, 'Le nom du joueur est requis').max(50, 'Le nom ne peut pas dépasser 50 caractères').optional(),
  pseudo: z.string().min(1, 'Le pseudo est requis').max(50, 'Le pseudo ne peut pas dépasser 50 caractères').optional(),
  avatar: z.string().url('URL d\'avatar invalide').optional(),
  favorite_game: z.string().max(100, 'Le nom du jeu favori ne peut pas dépasser 100 caractères').optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Au moins un champ doit être fourni pour la mise à jour'
});

// Game schemas
export const GameExpansionSchema = z.object({
  expansion_id: z.number().int().positive().optional(),
  game_id: z.number().int().positive().optional(),
  bgg_expansion_id: z.number().int().positive().optional(),
  name: z.string().min(1, 'Le nom de l\'extension est requis').max(200, 'Le nom ne peut pas dépasser 200 caractères'),
  year_published: z.number().int().min(1800, 'Année de publication invalide').max(new Date().getFullYear() + 5, 'Année de publication invalide').optional(),
  description: z.string().max(1000, 'La description ne peut pas dépasser 1000 caractères').optional()
});

export const GameCharacterSchema = z.object({
  character_id: z.number().int().positive().optional(),
  game_id: z.number().int().positive().optional(),
  character_key: z.string().min(1, 'La clé du personnage est requise').max(50, 'La clé ne peut pas dépasser 50 caractères'),
  name: z.string().min(1, 'Le nom du personnage est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  description: z.string().max(500, 'La description ne peut pas dépasser 500 caractères').optional(),
  avatar: z.string().url('URL d\'avatar invalide').optional(),
  abilities: z.array(z.string().max(100, 'Une capacité ne peut pas dépasser 100 caractères')).optional()
});

export const CreateGameBaseSchema = z.object({
  bgg_id: z.number().int().positive('ID BGG invalide').optional(),
  name: z.string().min(1, 'Le nom du jeu est requis').max(200, 'Le nom ne peut pas dépasser 200 caractères'),
  description: z.string().max(15000, 'La description ne peut pas dépasser 15000 caractères').optional(),
  image: z.string().url('URL d\'image invalide').optional().or(z.literal('')).transform(v => v || undefined),
  thumbnail: z.string().url('URL de miniature invalide').optional().or(z.literal('')).transform(v => v || undefined),
  min_players: z.number().int().min(1, 'Le nombre minimum de joueurs doit être au moins 1').max(99, 'Le nombre minimum de joueurs ne peut pas dépasser 99'),
  max_players: z.number().int().min(1, 'Le nombre maximum de joueurs doit être au moins 1').max(99, 'Le nombre maximum de joueurs ne peut pas dépasser 99'),
  playing_time: z.number().int().min(0, 'La durée de jeu ne peut pas être négative').optional(),
  min_playtime: z.number().int().min(0, 'La durée minimale ne peut pas être négative').optional(),
  max_playtime: z.number().int().min(0, 'La durée maximale ne peut pas être négative').optional(),
  duration: z.string().max(50, 'La durée ne peut pas dépasser 50 caractères').optional(),
  difficulty: z.string().max(20, 'La difficulté ne peut pas dépasser 20 caractères').optional(),
  category: z.string().max(100, 'La catégorie ne peut pas dépasser 100 caractères').optional(),
  categories: z.array(z.string().max(100)).optional(),
  mechanics: z.array(z.string().max(100)).optional(),
  year_published: z.number().int().min(1800, 'Année de publication invalide').max(new Date().getFullYear() + 5, 'Année de publication invalide').optional(),
  publisher: z.string().max(100, 'L\'éditeur ne peut pas dépasser 100 caractères').optional(),
  designer: z.string().max(100, 'Le créateur ne peut pas dépasser 100 caractères').optional(),
  bgg_rating: z.number().min(0, 'La note BGG ne peut pas être négative').max(10, 'La note BGG ne peut pas dépasser 10').optional(),
  weight: z.number().min(0, 'Le poids ne peut pas être négatif').max(5, 'Le poids ne peut pas dépasser 5').optional(),
  age_min: z.number().int().min(0, 'L\'âge minimum ne peut pas être négatif').max(99, 'L\'âge minimum ne peut pas dépasser 99').optional(),
  game_type: GameTypeSchema.optional(),
  supports_cooperative: z.boolean().optional(),
  supports_competitive: z.boolean().optional(),
  supports_campaign: z.boolean().optional(),
  supports_hybrid: z.boolean().optional(),
  has_expansion: z.boolean().optional(),
  has_characters: z.boolean().optional(),
  is_expansion: z.boolean().optional(),
  expansions: z.array(GameExpansionSchema).optional(),
  characters: z.array(GameCharacterSchema).optional()
});

export const CreateGameSchema = CreateGameBaseSchema.refine(data => data.min_players <= data.max_players, {
  message: 'Le nombre minimum de joueurs ne peut pas être supérieur au nombre maximum',
  path: ['min_players']
});

export const UpdateGameSchema = CreateGameBaseSchema.partial().refine(data => Object.keys(data).length > 0, {
  message: 'Au moins un champ doit être fourni pour la mise à jour'
});

// Character-specific schemas
export const CreateCharacterSchema = z.object({
  game_id: z.number().int().positive('ID de jeu invalide'),
  character_key: z.string().min(1, 'La clé du personnage est requise').max(50, 'La clé ne peut pas dépasser 50 caractères'),
  name: z.string().min(1, 'Le nom du personnage est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  description: z.string().max(500, 'La description ne peut pas dépasser 500 caractères').optional(),
  avatar: z.string().url('URL d\'avatar invalide').optional(),
  abilities: z.array(z.string().max(100, 'Une capacité ne peut pas dépasser 100 caractères')).default([])
});

export const UpdateCharacterSchema = z.object({
  character_key: z.string().min(1, 'La clé du personnage est requise').max(50, 'La clé ne peut pas dépasser 50 caractères').optional(),
  name: z.string().min(1, 'Le nom du personnage est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères').optional(),
  description: z.string().max(500, 'La description ne peut pas dépasser 500 caractères').optional(),
  avatar: z.string().url('URL d\'avatar invalide').optional(),
  abilities: z.array(z.string().max(100, 'Une capacité ne peut pas dépasser 100 caractères')).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Au moins un champ doit être fourni pour la mise à jour'
});

export const BulkCreateCharactersSchema = z.object({
  gameId: z.number().int().positive('ID de jeu invalide'),
  characters: z.array(z.object({
    character_key: z.string().min(1, 'La clé du personnage est requise').max(50, 'La clé ne peut pas dépasser 50 caractères'),
    name: z.string().min(1, 'Le nom du personnage est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
    description: z.string().max(500, 'La description ne peut pas dépasser 500 caractères').optional(),
    avatar: z.string().url('URL d\'avatar invalide').optional(),
    abilities: z.array(z.string().max(100, 'Une capacité ne peut pas dépasser 100 caractères')).default([])
  })).min(1, 'Au moins un personnage doit être fourni')
});

// Session schemas
export const SessionPlayerSchema = z.object({
  player_id: z.number().int().positive('ID de joueur invalide'),
  character_id: z.number().int().positive('ID de personnage invalide').optional(),
  score: z.number().min(0, 'Le score ne peut pas être négatif'),
  placement: z.number().int().min(1, 'La position ne peut pas être inférieure à 1').optional(),
  is_winner: z.boolean().optional(),
  notes: z.string().max(500, 'Les notes ne peuvent pas dépasser 500 caractères').optional()
});

export const CreateSessionSchema = z.object({
  game_id: z.number().int().positive('ID de jeu invalide'),
  session_date: z.string().datetime('Date de session invalide').optional().transform(val => val ? new Date(val) : new Date()),
  duration_minutes: z.number().int().min(1, 'La durée doit être au moins 1 minute').max(1440, 'La durée ne peut pas dépasser 24 heures').optional(),
  winner_player_id: z.number().int().positive('ID du joueur gagnant invalide').optional(),
  session_type: SessionTypeSchema.optional(),
  notes: z.string().max(1000, 'Les notes ne peuvent pas dépasser 1000 caractères').optional(),
  players: z.array(SessionPlayerSchema).min(1, 'Au moins un joueur doit être présent dans la session')
});

// Parameter validation schemas
export const IdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID invalide').transform(val => parseInt(val, 10))
});

export const GameIdParamSchema = z.object({
  gameId: z.string().regex(/^\d+$/, 'ID de jeu invalide').transform(val => parseInt(val, 10))
});

export const CharacterIdParamSchema = z.object({
  characterId: z.string().regex(/^\d+$/, 'ID de personnage invalide').transform(val => parseInt(val, 10))
});

// Type exports for use in controllers
export type CreatePlayerInput = z.infer<typeof CreatePlayerSchema>;
export type UpdatePlayerInput = z.infer<typeof UpdatePlayerSchema>;
export type CreateGameInput = z.infer<typeof CreateGameSchema>;
export type UpdateGameInput = z.infer<typeof UpdateGameSchema>;
export type CreateCharacterInput = z.infer<typeof CreateCharacterSchema>;
export type UpdateCharacterInput = z.infer<typeof UpdateCharacterSchema>;
export type BulkCreateCharactersInput = z.infer<typeof BulkCreateCharactersSchema>;
export type CreateSessionInput = z.infer<typeof CreateSessionSchema>;
export type SessionPlayerInput = z.infer<typeof SessionPlayerSchema>;