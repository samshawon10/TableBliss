export const CardSkeleton = () => (
  <div className="card p-4 animate-pulse">
    <div className="skeleton h-48 w-full rounded-lg mb-4" />
    <div className="skeleton h-4 w-3/4 mb-2" />
    <div className="skeleton h-4 w-1/2 mb-3" />
    <div className="skeleton h-3 w-full mb-1" />
    <div className="skeleton h-3 w-2/3" />
  </div>
);

export const TableRowSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4">
        <div className="skeleton h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-1/3" />
          <div className="skeleton h-3 w-1/4" />
        </div>
        <div className="skeleton h-8 w-20 rounded" />
      </div>
    ))}
  </div>
);

export const StatsCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse">
    <div className="skeleton h-10 w-10 rounded-lg mb-4" />
    <div className="skeleton h-4 w-1/2 mb-2" />
    <div className="skeleton h-8 w-1/3" />
  </div>
);

export const DetailSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="skeleton h-96 w-full rounded-xl" />
    <div className="space-y-3">
      <div className="skeleton h-8 w-1/2" />
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-2/3" />
    </div>
  </div>
);

export const MenuItemSkeleton = () => (
  <div className="flex items-center gap-4 p-4 animate-pulse">
    <div className="skeleton h-20 w-20 rounded-lg flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="skeleton h-4 w-1/3" />
      <div className="skeleton h-3 w-2/3" />
      <div className="skeleton h-4 w-1/5" />
    </div>
  </div>
);