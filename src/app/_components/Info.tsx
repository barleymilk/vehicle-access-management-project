import { Driver, TagInfo, Vehicle } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { FixedBottomButton } from "@/components/ui/fixed-bottom-button";
import { InfoItem } from "@/types";
import { useEffect, useState } from "react";
import { formatPhone } from "@/lib/utils";
import { ChevronLeft, ChevronRight, List, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface InfoProps {
  vehicleData: Vehicle | null;
  driverData: Driver[] | null;
  onSetDriverInfo: (driver: Driver | null) => void;
  onRecord: (vehicleId: string, driverId: string | null) => void;
}

const getVipLevel = (vipLevel: string | undefined): TagInfo | null => {
  if (!vipLevel) return null;

  const vipLevelMap: Record<string, TagInfo> = {
    VIP1: { text: "VIP1", variant: "destructive" },
    VIP2: { text: "VIP2", variant: "destructive" },
    VIP3: { text: "VIP3", variant: "destructive" },
    직원: { text: "직원", variant: "default" },
    대내기관: { text: "대내기관", variant: "default" },
    외부업체: { text: "외부업체", variant: "success" },
    일반: { text: "일반", variant: "secondary" },
    단체방문: { text: "단체방문", variant: "secondary" },
  };

  return vipLevelMap[vipLevel] || null;
};

export const Info = ({
  vehicleData,
  driverData,
  onSetDriverInfo,
  onRecord,
}: InfoProps) => {
  // console.log("Info > driverData:", driverData);
  // console.log("Info > vehicleData:", vehicleData);
  useEffect(() => {
    onSetDriverInfo(driverData?.[0] || null);
  }, []);

  const [currentDriverIndex, setCurrentDriverIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("existing");
  const [previousDriverIndex, setPreviousDriverIndex] = useState(0);

  // 탭 변경 핸들러
  const handleTabChange = (value: string) => {
    if (value === "new") {
      // 새로운 운전자 탭으로 전환 시 이전 인덱스 저장하고 null 설정
      setPreviousDriverIndex(currentDriverIndex);
      onSetDriverInfo(null);
    } else if (value === "existing") {
      // 기존 운전자 탭으로 돌아올 때 이전 상태 복원
      if (driverData && driverData.length > 0) {
        onSetDriverInfo(driverData[previousDriverIndex] || driverData[0]);
        setCurrentDriverIndex(previousDriverIndex);
      }
    }
    setActiveTab(value);
  };

  const vehicleInfo: InfoItem[] = [
    { label: "차량번호", value: vehicleData?.plate_number || "-" },
    { label: "차량종류", value: vehicleData?.vehicle_type || "-" },
    {
      label: "공용차량",
      value: vehicleData?.is_public_vehicle ? "공용" : "개인",
    },
    {
      label: "접근기간",
      value: vehicleData?.access_start_date
        ? `${vehicleData.access_start_date} ~ ${vehicleData.access_end_date}`
        : "-",
    },
    { label: "특이사항", value: vehicleData?.special_notes || "-" },
  ];
  const driverInfo: InfoItem[] = [
    {
      label: "운전자",
      value: driverData?.[currentDriverIndex]?.name || "-",
      tags: getVipLevel(driverData?.[currentDriverIndex]?.vip_level),
    },
    {
      label: "소속",
      value: driverData?.[currentDriverIndex]?.organization || "-",
    },
    {
      label: "부서",
      value: driverData?.[currentDriverIndex]?.department || "-",
    },
    { label: "직급", value: driverData?.[currentDriverIndex]?.position || "-" },
    {
      label: "연락처",
      value: driverData?.[currentDriverIndex]?.phone_number
        ? formatPhone(driverData[currentDriverIndex]?.phone_number)
        : "-",
    },
    {
      label: "활동기간",
      value: driverData?.[currentDriverIndex]?.activity_start_date
        ? `${driverData?.[currentDriverIndex]?.activity_start_date} ~ ${driverData?.[currentDriverIndex]?.activity_end_date}`
        : "-",
    },
    {
      label: "담당자명",
      value: driverData?.[currentDriverIndex]?.contact_person_name || "-",
    },
    {
      label: "담당자번호",
      value: driverData?.[currentDriverIndex]?.contact_person_phone
        ? formatPhone(driverData[currentDriverIndex]?.contact_person_phone)
        : "-",
    },
  ];

  return (
    <>
      {/* FREE PASS 차량인 경우 */}
      {vehicleData?.is_free_pass_enabled && (
        <div
          className="absolute top-15 -mx-6 text-center w-full py-8 h-[13rem]"
          style={{
            clipPath: "polygon(0 0, 100% 0, 100% 70%, 0 calc(100% - 15px))",
            background:
              "linear-gradient(149deg, rgba(106, 34, 195, 1) 0%, rgba(45, 187, 253, 1) 100%)",
          }}
        >
          <span className="text-3xl text-white font-bold">FREE PASS</span>
        </div>
      )}

      {/* 차량 정보 */}
      <Card
        className={`mb-4 relative z-10 ${
          vehicleData?.is_free_pass_enabled ? "mt-24" : "mt-6"
        }`}
      >
        <CardHeader>
          <CardTitle className="text-lg text-center">차량 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Table className="borderless">
            <TableBody>
              {vehicleInfo.map((info) => (
                <TableRow key={info.label} className="border-0">
                  <TableCell className="font-semibold w-24">
                    {info.label}
                  </TableCell>
                  <TableCell>
                    <div className="bg-black/5 rounded-lg px-3 py-1 flex items-center gap-2">
                      {info.value}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 운전자 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-center">운전자 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing">기존 운전자</TabsTrigger>
              <TabsTrigger value="new">새 운전자</TabsTrigger>
            </TabsList>

            <TabsContent value="existing" className="mt-4">
              {driverData && driverData.length > 0 ? (
                <>
                  <div className="flex items-center justify-center mb-4 relative">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const totalDrivers = driverData.length;
                          const prevIndex =
                            currentDriverIndex === 0
                              ? totalDrivers - 1
                              : currentDriverIndex - 1;
                          setPreviousDriverIndex(currentDriverIndex);
                          setCurrentDriverIndex(prevIndex);
                          onSetDriverInfo(driverData[prevIndex]);
                        }}
                        className="h-8 w-8"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-gray-500">
                        {currentDriverIndex + 1} / {driverData.length}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const totalDrivers = driverData.length;
                          const nextIndex =
                            currentDriverIndex === totalDrivers - 1
                              ? 0
                              : currentDriverIndex + 1;
                          setPreviousDriverIndex(currentDriverIndex);
                          setCurrentDriverIndex(nextIndex);
                          onSetDriverInfo(driverData[nextIndex]);
                        }}
                        className="h-8 w-8"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 absolute right-0"
                        >
                          <List className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        {driverData.map((driver, index) => (
                          <DropdownMenuItem
                            key={driver.id}
                            onClick={() => {
                              setPreviousDriverIndex(currentDriverIndex);
                              setCurrentDriverIndex(index);
                              onSetDriverInfo(driverData[index]);
                            }}
                            className="flex items-center justify-between"
                          >
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{driver.name}</span>
                              <span className="text-xs text-gray-500">
                                {driver.org_dept_pos}
                              </span>
                            </div>
                            {currentDriverIndex === index && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <Table>
                    <TableBody>
                      {driverInfo.map((info) => (
                        <TableRow key={info.label} className="border-0">
                          <TableCell className="font-semibold w-24">
                            {info.label}
                          </TableCell>
                          <TableCell>
                            <div className="bg-black/5 rounded-lg px-3 py-1 flex items-center gap-2">
                              {info.tags ? (
                                <div className="flex items-center gap-2">
                                  <span>{info.value}</span>
                                  <Badge variant={info.tags.variant}>
                                    {info.tags.text}
                                  </Badge>
                                </div>
                              ) : (
                                <span>{info.value}</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  등록된 운전자가 없습니다.
                </div>
              )}
            </TabsContent>

            <TabsContent value="new" className="mt-4">
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">새로운 운전자</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <FixedBottomButton
        onClick={() =>
          onRecord(
            vehicleData?.id || "",
            driverData?.[currentDriverIndex]?.id || ""
          )
        }
      >
        출입 기록 작성
      </FixedBottomButton>
    </>
  );
};
