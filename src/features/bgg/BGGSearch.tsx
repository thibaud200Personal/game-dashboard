import React, { useState, useRef } from 'react';
import { MagnifyingGlass, Link, Circle } from '@phosphor-icons/react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { bggApiService } from '@/features/bgg/bggApi';
import type { BGGGame, BGGSearchResult } from '@/types';
import { useLabels } from '@/shared/hooks/useLabels';

interface BGGSearchProps {
  onGameSelect: (game: BGGGame) => void
  onClose: () => void
}

export default function BGGSearch({ onGameSelect, onClose }: BGGSearchProps) {
  const { t } = useLabels();
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
      setSearchError(t('bgg.search.error.search_failed'));
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
      setSearchError(t('bgg.search.error.load_failed'));
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
      setSearchError(t('bgg.search.error.load_failed'));
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
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-white/60 w-4 h-4" />
          <Input
            id="bgg-search"
            name="bgg-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('bgg.search.placeholder')}
            className="pl-10"
            disabled={isSearching || isLoadingDetails}
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={isSearching || isLoadingDetails || !query.trim()}
        >
          {isSearching ? (
            <Circle className="w-4 h-4 animate-spin" />
          ) : (
            <MagnifyingGlass className="w-4 h-4" />
          )}
        </Button>
      </div>

      {searchError && (
        <div className="text-red-700 dark:text-red-400 text-sm p-3 bg-red-100 dark:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/20">
          {searchError}
        </div>
      )}

      {isLoadingDetails && (
        <div className="flex items-center justify-center py-8">
          <Circle className="w-6 h-6 animate-spin text-teal-400" />
          <span className="ml-2 text-slate-500 dark:text-white/60">{t('bgg.search.loading_details')}</span>
        </div>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {searchResults.map((result, index) => (
          <Card
            key={`${result.bgg_id}-${index}`}
            className="bg-white dark:bg-white/5 dark:backdrop-blur-md border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer"
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
                  <div className="w-12 h-12 rounded flex-shrink-0 bg-slate-200 dark:bg-white/10 flex items-center justify-center">
                    <MagnifyingGlass className="w-5 h-5 text-slate-400 dark:text-white/30" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-900 dark:text-white truncate">{result.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {result.year_published > 0 && (
                      <Badge variant="outline" className="border-slate-300 dark:border-white/20 text-slate-500 dark:text-white/60 text-xs">
                        {result.year_published}
                      </Badge>
                    )}
                    <Badge variant="outline" className="border-slate-300 dark:border-white/20 text-slate-500 dark:text-white/60 text-xs">
                      {result.is_expansion ? t('games.card.expansion') : t('bgg.search.badge.base_game')}
                    </Badge>
                  </div>
                </div>
                <Link className="w-4 h-4 text-blue-400 dark:text-white/40 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}

        {searchResults.length === 0 && query && !isSearching && (
          <div className="text-center py-8 text-slate-500 dark:text-white/60">
            {t('bgg.search.empty')}
          </div>
        )}
      </div>

      <div className="text-xs text-slate-400 dark:text-white/40 text-center">
        {t('bgg.search.footer')}
      </div>
    </div>
  );
}
