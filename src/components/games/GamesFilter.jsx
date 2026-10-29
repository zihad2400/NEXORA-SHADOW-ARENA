'use client';
import { useState, useEffect, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export default function GamesFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state for the inputs
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') || 'all');

  // Update URL function
  const updateFilters = (newQ, newCat, newDiff) => {
    const params = new URLSearchParams();
    if (newQ) params.set('q', newQ);
    if (newCat && newCat !== 'all') params.set('category', newCat);
    if (newDiff && newDiff !== 'all') params.set('difficulty', newDiff);
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only update if the search query actually changed from URL
      if (q !== (searchParams.get('q') || '')) {
        updateFilters(q, category, difficulty);
      }
    }, 500); // 500ms delay
    return () => clearTimeout(timer);
  }, [q]);

  // Handle instant filter changes for dropdowns
  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setCategory(val);
    updateFilters(q, val, difficulty);
  };

  const handleDifficultyChange = (e) => {
    const val = e.target.value;
    setDifficulty(val);
    updateFilters(q, category, val);
  };

  return (
    <div className={`surface p-4 mb-8 grid md:grid-cols-4 gap-3 transition-opacity ${isPending ? 'opacity-60' : 'opacity-100'}`}>
      <div className="relative md:col-span-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search games…"
          className="input-nexora w-full pr-10"
          aria-label="Search games"
        />
        {/* Loading spinner inside search bar */}
        {isPending && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-violet border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>

      <select 
        value={category} 
        onChange={handleCategoryChange} 
        className="input-nexora" 
        aria-label="Category"
      >
        <option value="all">All categories</option>
        <option value="arcade">Arcade</option>
        <option value="reflex">Reflex</option>
        <option value="puzzle">Puzzle</option>
      </select>

      <div className="flex gap-2">
        <select 
          value={difficulty} 
          onChange={handleDifficultyChange} 
          className="input-nexora" 
          aria-label="Difficulty"
        >
          <option value="all">All levels</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        {(q || category !== 'all' || difficulty !== 'all') && (
          <button 
            onClick={() => {
              setQ('');
              setCategory('all');
              setDifficulty('all');
              router.push(pathname);
            }}
            className="btn-ghost-nexora px-3 text-xs"
            title="Clear filters"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
