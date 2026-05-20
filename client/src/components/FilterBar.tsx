import './FilterBar.css';

interface FilterBarProps {
  selectedFilter: string;
  selectedSort: string;
  selectedLabel: string;
  availableLabels: string[];
  onFilterChange: (filter: string) => void;
  onSortChange: (sort: string) => void;
  onLabelChange: (label: string) => void;
}

export function FilterBar({
  selectedFilter,
  selectedSort,
  selectedLabel,
  availableLabels,
  onFilterChange,
  onSortChange,
  onLabelChange,
}: FilterBarProps) {
  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label htmlFor="date-filter" className="filter-label">View</label>
        <select
          id="date-filter"
          value={selectedFilter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Tasks</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="active">Active Only</option>
          <option value="completed">Completed Only</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="sort-order" className="filter-label">Sort</label>
        <select
          id="sort-order"
          value={selectedSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="filter-select"
        >
          <option value="date-asc">Due Date (Earliest)</option>
          <option value="date-desc">Due Date (Latest)</option>
          <option value="priority">Priority (High to Low)</option>
          <option value="created">Recently Created</option>
        </select>
      </div>

      {availableLabels.length > 0 && (
        <div className="filter-group">
          <label htmlFor="label-filter" className="filter-label">Label</label>
          <select
            id="label-filter"
            value={selectedLabel}
            onChange={(e) => onLabelChange(e.target.value)}
            className="filter-select"
          >
            <option value="">All Labels</option>
            {availableLabels.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
