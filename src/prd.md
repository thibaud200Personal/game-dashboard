# Board Game Score Tracker - Product Requirements Document

## Core Purpose & Success

**Mission Statement**: A modern, intuitive dashboard for tracking board game players, games, and statistics with a beautiful dark theme interface.

**Success Indicators**:
- Users can easily add and manage players and games
- Data persists between sessions via SQLite (backend Express + better-sqlite3)
- Interface feels modern and responsive
- Navigation between different sections is seamless
- Support for multiple game modes (competitive, cooperative, campaign, hybrid)

**Experience Qualities**: Modern, Intuitive, Elegant

## Project Classification & Approach

**Complexity Level**: Light Application (multiple features with basic state management)

**Primary User Activity**: Creating and Managing (adding players/games, tracking statistics)

## Schema — Game Mode Support

**Game Mode Support**: Games can support multiple modes simultanément :
- `supports_competitive`: Traditional player-vs-player gameplay
- `supports_cooperative`: Players work together against the game
- `supports_campaign`: Story-driven, multi-session gameplay  
- `supports_hybrid`: Mixed cooperative/competitive or special mechanics

## Thought Process for Feature Selection

**Core Problem Analysis**: Board game enthusiasts need a way to track their players, game collection, and statistics in an organized, visually appealing manner, with proper support for diverse game types.

**User Context**: Used during game nights or when organizing board game sessions to manage players and game information.

**Critical Path**: Dashboard overview → Navigate to Players/Games → Add/manage entries → Return to dashboard

**Key Moments**: 
1. First impression on dashboard with circular stats
2. Adding new players/games through modal dialogs
3. Browsing and searching through collections
4. Viewing game mode badges to understand supported play styles

## Essential Features

### Database Structure & Data Management
- **Functionality**: Architecture relationnelle SQLite avec 6 tables, 2 vues SQL, validation Zod
- **Purpose**: Persistance complète via backend Express — players, games, sessions, expansions, characters
- **Success Criteria**: Interface couvre tous les champs BDD sans breaking changes

### Dashboard Overview
- **Functionality**: Central hub showing key statistics and recent activity
- **Purpose**: Quick overview of player count, game count, and recent activity
- **Success Criteria**: Users immediately understand their collection size and recent activity

### Players Management  
- **Functionality**: View, add, search, and delete players with stats tracking
- **Purpose**: Maintain a database of regular players with their performance metrics
- **Success Criteria**: Easy to find specific players and see their game history

### Games Collection
- **Functionality**: View, add, search, and delete games with detailed information including BoardGameGeek integration
- **Purpose**: Catalog available games with comprehensive metadata from BGG API, including expansions and character information
- **Success Criteria**: Quick access to game information when planning game nights, automatic data population from BGG

### BoardGameGeek Integration
- **Functionality**: Search and import game data directly from BoardGameGeek database
- **Purpose**: Eliminate manual data entry by leveraging the comprehensive BGG database
- **Success Criteria**: Users can quickly find and import detailed game information with minimal typing

### Enhanced Game Data
- **Functionality**: Track game types (competitive, cooperative, campaign, hybrid), characters/roles, and expansions
- **Purpose**: Provide comprehensive game information for better game selection and planning
- **Success Criteria**: Users can easily identify suitable games based on type and player roles available

### Persistent Data Storage
- **Functionality**: Toutes les données sont sauvegardées en SQLite via le backend (port 3001)
- **Purpose**: Les données survivent aux redémarrages navigateur et serveur
- **Success Criteria**: Données intactes après refresh ou redémarrage du backend

## Design Direction

### Visual Tone & Identity
**Emotional Response**: The design should evoke excitement and organization - like a premium gaming companion app.

**Design Personality**: Modern, sleek, professional yet playful - reflecting the serious hobby aspect of board gaming while maintaining the fun element.

**Visual Metaphors**: Dark space/cosmic theme suggesting endless possibilities, with glowing elements representing the warmth of social gaming.

**Simplicity Spectrum**: Clean and minimal interface that doesn't overwhelm users but provides rich functionality when needed.

### Color Strategy
**Color Scheme Type**: Analogous with complementary accents (teal/cyan family with warm accent colors)

**Primary Color**: Teal (#14b8a6) - trustworthy, calming, and associated with digital interfaces
**Secondary Colors**: Emerald (#10b981) and cyan variants for variety while maintaining harmony  
**Accent Color**: Warm teal for call-to-action buttons and highlights
**Color Psychology**: Cool colors create a calm, professional environment while the glowing effects add excitement
**Color Accessibility**: High contrast white text on dark backgrounds ensures WCAG AA compliance

**Foreground/Background Pairings**:
- Primary text: White (#fefefe) on dark slate background (#0f172a)
- Card text: Light gray (#f1f5f9) on semi-transparent white cards
- Accent text: Teal (#14b8a6) on dark backgrounds for highlights
- All pairings exceed 4.5:1 contrast ratio for accessibility

### Typography System
**Font Pairing Strategy**: Single clean sans-serif font family for consistency and simplicity
**Typographic Hierarchy**: Clear distinction between headers (24px, bold), subheaders (18px, semibold), body text (14px), and captions (12px)
**Font Personality**: Clean, modern, legible - reflecting the organized nature of the app
**Readability Focus**: Generous line spacing (1.5x) and appropriate sizing for mobile-first design
**Typography Consistency**: Consistent use of font weights and sizes throughout
**Which fonts**: Using system fonts (San Francisco on macOS, Segoe UI on Windows) for optimal performance and native feel
**Legibility Check**: All text maintains high contrast against backgrounds and uses appropriate sizing for mobile devices

### Visual Hierarchy & Layout
**Attention Direction**: Circular stats draw immediate attention, followed by card-based sections with clear visual separation
**White Space Philosophy**: Generous padding and margins create breathing room and prevent cognitive overload
**Grid System**: Consistent 4px grid system for spacing and alignment
**Responsive Approach**: Mobile-first design with touch-friendly targets (44px minimum)
**Content Density**: Balanced information display - enough detail to be useful without overwhelming

### Animations
**Purposeful Meaning**: Subtle hover effects and transitions communicate interactivity and provide satisfying feedback
**Hierarchy of Movement**: Hover states on interactive elements, smooth page transitions, gentle loading states
**Contextual Appropriateness**: Minimal, fast animations that enhance rather than distract from the experience

### UI Elements & Component Selection
**Component Usage**: 
- Cards for content grouping
- Dialogs for form inputs
- Badges for categorization
- Avatars for player representation
- Buttons with clear visual hierarchy

**Component Customization**: Dark theme adaptations of shadcn components with glassmorphic backgrounds
**Component States**: Clear hover, active, and focus states for all interactive elements
**Icon Selection**: Phosphor icons for consistency and clarity
**Component Hierarchy**: Primary actions (add buttons), secondary actions (navigation), tertiary actions (delete/edit)
**Spacing System**: Consistent use of Tailwind's spacing scale (4, 6, 8, 12, 16, 24px)
**Mobile Adaptation**: Bottom navigation for primary actions, full-width cards for mobile, touch-friendly targets

### Visual Consistency Framework
**Design System Approach**: Component-based design using shadcn as the foundation
**Style Guide Elements**: Consistent spacing, colors, typography, and interaction patterns
**Visual Rhythm**: Regular card-based layouts create predictable patterns
**Brand Alignment**: Gaming-focused visual language with premium feel

### Accessibility & Readability
**Contrast Goal**: WCAG AA compliance achieved through high contrast white text on dark backgrounds and proper color selection for all interactive elements.

## Edge Cases & Problem Scenarios

**Potential Obstacles**: 
- Users accidentally deleting important data
- Large numbers of players/games affecting performance
- Empty states when no data exists

**Edge Case Handling**: 
- Confirmation patterns for destructive actions
- Search functionality for large datasets
- Helpful empty states guiding users to add content

**Technical Constraints**:
- BGG API rate limits (pas de clé API, appels XML publics)
- Mobile device performance considerations

## Implementation Considerations

**Scalability Needs**: SQLite gère efficacement les collections de centaines d'entrées ; l'intégration BGG donne accès à des milliers de jeux
**Testing Focus**: Cross-browser compatibility, mobile responsiveness, data persistence, BGG API error handling
**Critical Questions**: How to handle BGG API rate limits and offline functionality when API is unavailable

## Reflection

This approach is uniquely suited to board game enthusiasts who want a digital companion for their hobby without the complexity of a full game management system. The focus on visual appeal and ease of use makes it approachable for casual users while providing enough depth for serious board gamers.

The glassmorphic dark theme creates a premium feel that matches the quality aesthetic many board game enthusiasts appreciate in their physical games. The persistent data storage ensures users can build their collection over time without losing progress.

The mobile-first approach recognizes that this tool would often be used during social gatherings where mobile devices are more convenient than laptops.

---

## Intentions initiales — trace historique

> Ce qui suit documente les choix envisagés à l'origine qui ont évolué en cours de développement. Conservé comme référence de décision.

### Persistance : localStorage (abandonné → SQLite)

L'intention initiale était une application légère sans backend, avec persistance via `localStorage` du navigateur :

- **Classification envisagée** : Light Application (multiple features with basic state management)
- **Contrainte envisagée** : Browser local storage limitations
- **Scalabilité envisagée** : "Local storage can handle hundreds of entries efficiently"
- **Critère de succès initial** : "Data persists between sessions using local storage"

**Pourquoi ça a évolué** : Le périmètre fonctionnel (sessions, statistiques par vues SQL, relations entre tables) rendait un vrai backend nécessaire. Le projet est passé à Express + SQLite avec better-sqlite3.

### Suppression du champ `game_type` (non réalisé)

Le PRD initial mentionnait :
- **Removed** : `game_type` field from Games table
- **Intent** : Remplacer l'enum `game_type` par les 4 flags booléens `supports_*` uniquement

**État réel dans le code** : `game_type TEXT CHECK(game_type IN ('competitive', 'cooperative', 'campaign', 'hybrid'))` est toujours présent dans `schema.sql`, en coexistence avec les 4 flags booléens. La migration vers les flags seuls n'a pas été faite — les deux systèmes cohabitent.