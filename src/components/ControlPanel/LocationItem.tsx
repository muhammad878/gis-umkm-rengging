import { Location } from "@/types";

interface LocationItemProps {
    location: Location;
    onClick?: () => void;
}

export const LocationItem = ({ location, onClick }: LocationItemProps) => {
    const conditionColor =
        {
            Baik: "bg-green-100 text-green-700",
            "Rusak Ringan": "bg-yellow-100 text-yellow-700",
            "Rusak Berat": "bg-red-100 text-red-700",
        }[location.condition || ""] || "bg-gray-100 text-gray-600";

    return (
        <button
            onClick={onClick}
            className="w-full text-left p-3 rounded-lg bg-white border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all group cursor-pointer"
        >
            <div className="flex items-start gap-2">
                <div
                    className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0"
                    style={{ backgroundColor: location.color || "#3b82f6" }}
                />
                <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-medium text-gray-900 truncate group-hover:text-blue-600">
                        {location.name}
                    </h3>
                    {location.address && (
                        <p className="text-[10px] text-gray-500 truncate mt-0.5">
                            {location.address}
                        </p>
                    )}
                    <div className="flex items-center gap-1.5 mt-1">
                        {location.condition && (
                            <span
                                className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${conditionColor}`}
                            >
                                {location.condition}
                            </span>
                        )}
                        {location.dusun && (
                            <span className="text-[9px] text-gray-400">{location.dusun}</span>
                        )}
                    </div>
                </div>
            </div>
        </button>
    );
};
