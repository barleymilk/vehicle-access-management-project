import { Vehicle } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface VehicleChoiceProps {
  data: Vehicle[];
  onChoice: (vehicle: Vehicle | null) => void;
}

export const VehicleChoice = ({ data, onChoice }: VehicleChoiceProps) => {
  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        className="w-full mt-4"
        onClick={() => onChoice(null)}
      >
        새로 등록
      </Button>
      {data.map((vehicle) => (
        <Card
          key={vehicle.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
        >
          <CardHeader className="pb-0">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-md">
                  <span>{vehicle.plate_number}</span>
                  <span className="text-gray-600 ml-2 text-sm font-normal">
                    ({vehicle.vehicle_type})
                  </span>
                </CardTitle>
              </div>
              <div className="flex gap-2">
                <Badge
                  variant={vehicle.is_public_vehicle ? "default" : "secondary"}
                >
                  {vehicle.is_public_vehicle ? "공용" : "개인"}
                </Badge>
                <Badge
                  variant={
                    vehicle.is_free_pass_enabled ? "destructive" : "outline"
                  }
                >
                  {vehicle.is_free_pass_enabled ? "프리패스" : "제한"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {vehicle.special_notes && (
              <p className="text-sm text-gray-600 mb-3">
                특이사항: {vehicle.special_notes}
              </p>
            )}
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => onChoice(vehicle)}>
                선택
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
