interface FilterChipsProps {
  filters: string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function FilterChips({ filters, activeFilter, onFilterChange }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={`px-4 py-2 rounded-full text-sm transition-all ${
            activeFilter === filter
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-card text-foreground border border-border hover:border-primary/50'
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
