import React, { useState, useRef } from 'react';
import { MagnifyingGlass, Link, Circle } from '@phosphor-icons/react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { bggApiService } from '@/services/bggApi';
import type { BGGGame, BGGSearchResult } from '@/types';

interface BGGSearchProps {
  onGameSelect: (game: BGGGame) => void
  onClose: () => void
  darkMode?: boolean;
}

export default function BGGSearch({ onGameSelect, onClose, darkMode = true }: BGGSearchProps) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BGGSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [searchError, setSearchError] = useState('');
  const enrichmentIdRef = useRef(0);

  const handleSearch = async () => {
    if (!query.trim()) return;

    // If query looks like a BGG ID (numeric), load details directly
    const trimmed = query.trim();
    const bggId = /^\d+$/.test(trimmed) ? parseInt(trimmed) : null;
    if (bggId) {
      await handleLoadById(bggId);
      return;
    }

    setIsSearching(true);
    setSearchError('');

    // Increment to invalidate any in-progress enrichment from a previous search
    const searchId = ++enrichmentIdRef.current;

    try {
      const results = await bggApiService.searchGames(trimmed);
      setSearchResults(results);

      // Enrich thumbnails + years sequentially; abort if a new search starts
      for (const result of results) {
        if (enrichmentIdRef.current !== searchId) break;
        try {
          const details = await bggApiService.getGameDetails(result.bgg_id);
          if (enrichmentIdRef.current !== searchId) break;
          if (details) {
            setSearchResults(prev =>
              prev.map(r =>
                r.bgg_id === result.bgg_id
                  ? { ...r, thumbnail: details.thumbnail || details.image || r.thumbnail, year_published: details.year_published || r.year_published }
                  : r
              )
            );
          }
        } catch {
          // Silently ignore enrichment failures for individual results
        }
      }
    } catch {
      setSearchError('Échec de la recherche sur BoardGameGeek. Veuillez réessayer.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleLoadById = async (id: number) => {
    setIsLoadingDetails(true);
    setSearchError('');
    try {
      const gameDetails = await bggApiService.getGameDetails(id);
      onGameSelect(gameDetails);
      onClose();
    } catch {
      setSearchError('Impossible de charger les détails du jeu. Veuillez réessayer.');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleGameSelect = async (result: BGGSearchResult) => {
    setIsLoadingDetails(true);

    try {
      const gameDetails = await bggApiService.getGameDetails(result.bgg_id);
      onGameSelect(gameDetails);
      onClose();
    } catch {
      setSearchError('Impossible de charger les détails du jeu. Veuillez réessayer.');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={darkMode ? "space-y-4" : "space-y-4 bg-slate-50 text-slate-900 p-4 rounded-xl border border-slate-200"}>
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <MagnifyingGlass className={darkMode ? "absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" : "absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4"} />
          <Input
            id="bgg-search"
            name="bgg-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher par nom ou ID BGG..."
            className={darkMode ? "pl-10 bg-slate-700 border-slate-600 text-white" : "pl-10 bg-white border-slate-300 text-slate-900"}
            disabled={isSearching || isLoadingDetails}
          />
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={isSearching || isLoadingDetails || !query.trim()}
          className={darkMode ? "bg-teal-600 hover:bg-teal-700" : "bg-blue-100 hover:bg-blue-200 text-blue-700"}
        >
          {isSearching ? (
            <Circle className={darkMode ? "w-4 h-4 animate-spin" : "w-4 h-4 animate-spin text-blue-700"} />
          ) : (
            <MagnifyingGlass className={darkMode ? "w-4 h-4" : "w-4 h-4 text-blue-700"} />
          )}
        </Button>
      </div>

      {searchError && (
        <div className={darkMode ? "text-red-400 text-sm p-3 bg-red-500/10 rounded-lg border border-red-500/20" : "text-red-700 text-sm p-3 bg-red-100 rounded-lg border border-red-200"}>
          {searchError}
        </div>
      )}

      {isLoadingDetails && (
        <div className="flex items-center justify-center py-8">
          <Circle className={darkMode ? "w-6 h-6 animate-spin text-teal-400" : "w-6 h-6 animate-spin text-blue-700"} />
          <span className={darkMode ? "ml-2 text-white/60" : "ml-2 text-blue-700/80"}>Chargement des détails...</span>
        </div>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {searchResults.map((result, index) => (
          <Card
            key={`${result.bgg_id}-${index}`}
            className={darkMode ? "bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all cursor-pointer" : "bg-white border-slate-200 hover:bg-slate-100 transition-all cursor-pointer"}
            onClick={() => handleGameSelect(result)}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                {result.thumbnail ? (
                  <img
                    src={result.thumbnail}
                    alt={result.name}
                    className="w-12 h-12 object-cover rounded flex-shrink-0"
                  />
                ) : (
                  <div className={darkMode ? "w-12 h-12 rounded flex-shrink-0 bg-white/10 flex items-center justify-center" : "w-12 h-12 rounded flex-shrink-0 bg-slate-200 flex items-center justify-center"}>
                    <MagnifyingGlass className={darkMode ? "w-5 h-5 text-white/30" : "w-5 h-5 text-slate-400"} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className={darkMode ? "font-medium text-white truncate" : "font-medium text-slate-900 truncate"}>{result.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {result.year_published > 0 && (
                      <Badge variant="outline" className={darkMode ? "border-white/20 text-white/60 text-xs" : "border-slate-300 text-slate-500 text-xs"}>
                        {result.year_published}
                      </Badge>
                    )}
                    <Badge variant="outline" className={darkMode ? "border-white/20 text-white/60 text-xs" : "border-slate-300 text-slate-500 text-xs"}>
                      {result.is_expansion ? 'Extension' : 'Jeu de base'}
                    </Badge>
                  </div>
                </div>
                <Link className={darkMode ? "w-4 h-4 text-white/40 flex-shrink-0" : "w-4 h-4 text-blue-400 flex-shrink-0"} />
              </div>
            </CardContent>
          </Card>
        ))}
        
        {searchResults.length === 0 && query && !isSearching && (
          <div className={darkMode ? "text-center py-8 text-white/60" : "text-center py-8 text-slate-500"}>
            Aucun jeu trouvé. Essayez un autre terme de recherche.
          </div>
        )}
      </div>

      <div className={darkMode ? "text-xs text-white/40 text-center" : "text-xs text-slate-400 text-center"}>
        Données de BoardGameGeek.com · Entrez un ID BGG pour un chargement direct
      </div>
    </div>
  );
}