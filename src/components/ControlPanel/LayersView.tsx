import { Search, Filter, Layers, ChevronDown, ChevronRight } from "lucide-react";
import { Category, Location } from "@/types";
import { CONDITION_FILTERS } from "@/constants";
import { useState, useMemo } from "react";
import { LocationItem } from "./LocationItem";

interface LayersViewProps {
  categories: Category[];
  locations: Location[];
  selectedSubcategories: string[];
  selectedConditions: string[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onReset: () => void;
  onSubcategoryChange: (id: string) => void;
  onSubcategoriesChange: (ids: string[]) => void;
  onConditionChange: (condition: string) => void;
  onLocationClick?: (location: Location) => void;
}

export const LayersView = ({
  categories,
  locations,
  selectedSubcategories,
  selectedConditions,
  loading,
  searchQuery,
  onSearchChange,
  onReset,
  onSubcategoryChange,
  onSubcategoriesChange,
  onConditionChange,
  onLocationClick,
}: LayersViewProps) => {
  // Calculate used subcategory IDs
  const usedSubcategoryIds = useMemo(() => {
    const ids = new Set<string>();
    locations.forEach((loc) => {
      if (loc.subcategory_id) {
        ids.add(loc.subcategory_id);
      }
    });
    return ids;
  }, [locations]);

  // Filter locations based on search query
  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return locations.filter(
      (loc) =>
        loc.name?.toLowerCase().includes(query) ||
        loc.description?.toLowerCase().includes(query) ||
        loc.address?.toLowerCase().includes(query)
    );
  }, [locations, searchQuery]);

  return (
    <>
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
        <input
          type="text"
          placeholder="Cari lokasi..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      {searchQuery.trim() ? (
        // Search Results View
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-gray-900">
              Hasil Pencarian
            </h2>
            <span className="text-[10px] text-gray-500">
              {filteredLocations.length} lokasi
            </span>
          </div>

          {filteredLocations.length === 0 ? (
            <div className="text-xs text-gray-500 italic">
              Lokasi tidak ditemukan.
            </div>
          ) : (
            <div className="space-y-1">
              {filteredLocations.map((location) => (
                <LocationItem
                  key={location.id}
                  location={location}
                  onClick={() => onLocationClick?.(location)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        // Default Layers View
        <>
          {/* Layers */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Layer Pemetaan
              </h2>
              <button
                onClick={onReset}
                className="text-[10px] text-blue-600 font-medium hover:text-blue-700 cursor-pointer"
              >
                Reset
              </button>
            </div>

            {loading ? (
              <div className="text-xs text-gray-500">Memuat kategori...</div>
            ) : (
              <div className="space-y-4">
                {categories.map((category) => (
                  <CategoryItem
                    key={category.id}
                    category={category}
                    usedSubcategoryIds={usedSubcategoryIds}
                    selectedSubcategories={selectedSubcategories}
                    onSubcategoryChange={onSubcategoryChange}
                    onCategoryToggle={(cat, isChecked) => {
                      // Filter subcategories to only include used ones
                      const visibleSubcategories = cat.subcategories?.filter(s => usedSubcategoryIds.has(s.id)) || [];

                      if (visibleSubcategories.length > 0) {
                        const subIds = visibleSubcategories.map((s) => s.id);
                        // Also include the category ID itself
                        const allIds = [...subIds, cat.id];

                        if (isChecked) {
                          // Add all visible subcategories + category ID that are not already selected
                          const toAdd = allIds.filter(
                            (id) => !selectedSubcategories.includes(id)
                          );
                          onSubcategoriesChange([
                            ...selectedSubcategories,
                            ...toAdd,
                          ]);
                        } else {
                          // Remove all visible subcategories + category ID
                          const newSelected = selectedSubcategories.filter(
                            (id) => !allIds.includes(id)
                          );
                          onSubcategoriesChange(newSelected);
                        }
                      } else {
                        onSubcategoryChange(cat.id);
                      }
                    }}
                  />
                ))}
                {categories.length === 0 && (
                  <div className="text-xs text-gray-500 italic">
                    Belum ada kategori data.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Condition Filters */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" />
                Filter Kondisi
              </h2>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {CONDITION_FILTERS.map((status) => (
                <button
                  key={status}
                  onClick={() => onConditionChange(status)}
                  className={`px-2.5 py-1 text-[10px] font-medium rounded-full transition-colors cursor-pointer ${selectedConditions.includes(status)
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};

// Extracted sub-component for category items
interface CategoryItemProps {
  category: Category;
  usedSubcategoryIds: Set<string>;
  selectedSubcategories: string[];
  onSubcategoryChange: (id: string) => void;
  onCategoryToggle: (category: Category, isChecked: boolean) => void;
}

const CategoryItem = ({
  category,
  usedSubcategoryIds,
  selectedSubcategories,
  onSubcategoryChange,
  onCategoryToggle,
}: CategoryItemProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Filter subcategories based on usage
  const visibleSubcategories = useMemo(() => {
    return category.subcategories?.filter(sub => usedSubcategoryIds.has(sub.id)) || [];
  }, [category.subcategories, usedSubcategoryIds]);

  const hasSubcategories = visibleSubcategories.length > 0;

  // Check if all visible subcategories are selected
  const isAllSelected = useMemo(() => {
    if (!hasSubcategories) {
      return selectedSubcategories.includes(category.id);
    }
    // Check if all visible subcategories AND the category itself are selected
    return (
      visibleSubcategories.every((sub) =>
        selectedSubcategories.includes(sub.id)
      ) && selectedSubcategories.includes(category.id)
    );
  }, [category.id, selectedSubcategories, hasSubcategories, visibleSubcategories]);

  // Check if some but not all visible subcategories are selected
  const isIndeterminate = useMemo(() => {
    if (!hasSubcategories) return false;
    const subIds = visibleSubcategories.map((s) => s.id);
    // Include category.id in the count of "selectable items"
    const allIds = [...subIds, category.id];
    const selectedCount = allIds.filter((id) =>
      selectedSubcategories.includes(id)
    ).length;
    return selectedCount > 0 && selectedCount < allIds.length;
  }, [category.id, selectedSubcategories, hasSubcategories, visibleSubcategories]);

  const handleCategoryClick = () => {
    onCategoryToggle(category, !isAllSelected);
  };

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between bg-gray-50 p-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            checked={isAllSelected}
            ref={(input) => {
              if (input) input.indeterminate = isIndeterminate;
            }}
            onChange={handleCategoryClick}
          />
          <span className="text-xs font-semibold text-gray-700">
            {category.name}
          </span>
        </div>
        {hasSubcategories && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600 p-0.5 rounded hover:bg-gray-200 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="p-2 space-y-1 bg-white">
          {hasSubcategories ? (
            <>
              {visibleSubcategories.map((sub) => (
                <CheckboxItem
                  key={sub.id}
                  id={sub.id}
                  label={sub.name}
                  checked={selectedSubcategories.includes(sub.id)}
                  onChange={() => onSubcategoryChange(sub.id)}
                  className="ml-5"
                />
              ))}
            </>
          ) : (
            null
          )}
        </div>
      )}
    </div>
  );
};

// Reusable checkbox component
interface CheckboxItemProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
  className?: string;
}

const CheckboxItem = ({
  label,
  checked,
  onChange,
  className = "",
}: CheckboxItemProps) => (
  <label
    className={`flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer group ${className}`}
  >
    <input
      type="checkbox"
      className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
      checked={checked}
      onChange={onChange}
    />
    <span className="text-xs text-gray-600 group-hover:text-gray-900">
      {label}
    </span>
  </label>
);
