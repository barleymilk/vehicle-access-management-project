"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";

import { addPersonToSupabase } from "@/hooks/useSupabase";
import { uploadImageToSupabase } from "@/hooks/useSupabase";
import { SelectField } from "@/components/ui/select-field";

export interface PeopleFilters {
  name?: string;
  organization?: string;
  department?: string;
  position?: string;
  phone_number?: string;
  vip_level?: string;
  is_worker?: boolean;
  status?: string;
  activity_start_date?: Date;
  activity_end_date?: Date;
  photo_path?: string;
}

interface UpdateModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
}

export default function UpdateModal({
  open,
  onCancel,
  onSuccess,
}: UpdateModalProps) {
  const [filters, setFilters] = useState<PeopleFilters>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const handleSaveImage = async () => {
    try {
      setIsUploading(true);
      setUploadProgress("데이터 검증 중...");

      let photoUrl = null;

      if (selectedFile) {
        setUploadProgress("이미지 업로드 중...");
        console.log(
          "이미지 업로드 시작:",
          selectedFile.name,
          selectedFile.size
        );

        if (selectedFile.size > 5 * 1024 * 1024) {
          throw new Error("이미지 파일 크기가 5MB를 초과합니다.");
        }

        if (!selectedFile.type.startsWith("image/")) {
          throw new Error("올바른 이미지 파일이 아닙니다.");
        }

        photoUrl = await uploadImageToSupabase(
          selectedFile,
          "images",
          "people"
        );
        if (!photoUrl) {
          throw new Error(
            "이미지 업로드에 실패했습니다. Storage 버킷 권한을 확인해주세요."
          );
        }

        console.log("이미지 업로드 성공:", photoUrl);
        setUploadProgress("데이터 저장 중...");
      }

      const personData = {
        ...filters,
        photo_path: photoUrl || filters.photo_path,
      };

      const result = await addPersonToSupabase(personData);
      if (result.error) {
        const errorMessage =
          result.error &&
          typeof result.error === "object" &&
          "message" in result.error
            ? String((result.error as Record<string, unknown>).message)
            : "알 수 없는 오류";
        throw new Error(`데이터 저장 실패: ${errorMessage}`);
      }

      console.log("데이터 저장 성공:", result);
      setUploadProgress("완료!");

      setTimeout(() => {
        setFilters({});
        setSelectedFile(null);
        setIsUploading(false);
        setUploadProgress("");
        onSuccess?.();
        onCancel();
      }, 1000);
    } catch (error) {
      console.error("데이터 저장 중 오류:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";
      alert(`데이터 저장에 실패했습니다: ${errorMessage}`);
    } finally {
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  const handleClear = () => {
    setFilters({});
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>사람 정보 추가</DialogTitle>
          <DialogDescription>
            새로운 사람의 정보를 입력하세요.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <InputField
            id="name"
            label="이름"
            value={filters.name || ""}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, name: value }))
            }
            placeholder="이름을 입력하세요"
            required
          />
          <InputField
            id="organization"
            label="소속"
            value={filters.organization || ""}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, organization: value }))
            }
            placeholder="소속을 입력하세요"
          />
          <InputField
            id="department"
            label="부서"
            value={filters.department || ""}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, department: value }))
            }
            placeholder="부서를 입력하세요"
          />
          <InputField
            id="position"
            label="직책"
            value={filters.position || ""}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, position: value }))
            }
            placeholder="직책을 입력하세요"
          />
          <InputField
            id="phone_number"
            label="전화번호"
            value={filters.phone_number || ""}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, phone_number: value }))
            }
            placeholder="전화번호를 입력하세요"
          />

          {/* VIP 레벨 선택 */}
          <SelectField
            id="vip_level"
            label="VIP 레벨"
            value={filters.vip_level || "일반"}
            options={[
              { value: "VIP1", label: "VIP1" },
              { value: "VIP2", label: "VIP2" },
              { value: "VIP3", label: "VIP3" },
              { value: "직원", label: "직원" },
              { value: "대내기관", label: "대내기관" },
              { value: "외부업체", label: "외부업체" },
              { value: "단체방문", label: "단체방문" },
              { value: "일반", label: "일반" },
            ]}
            onChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                vip_level: value,
              }))
            }
          />

          {/* 외부용역 여부 */}
          <SelectField
            id="is_worker"
            label="외부용역"
            value={filters.is_worker ? "true" : "false"}
            options={[
              { value: "false", label: "외부 용역 X" },
              { value: "true", label: "외부 용역 O" },
            ]}
            onChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                is_worker: value === "true",
              }))
            }
          />

          {/* 상태 선택 */}
          <SelectField
            id="status"
            label="상태"
            value={filters.status || "active"}
            options={[
              { value: "active", label: "활성" },
              { value: "inactive", label: "비활성" },
              { value: "blocked", label: "차단" },
            ]}
            onChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                status: value,
              }))
            }
          />

          {/* 활동 시작일 */}
          <div className="flex items-center gap-2 mt-3">
            <label
              htmlFor="activity_start_date"
              className={"w-22 flex-shrink-0 text-md font-semibold"}
            >
              활동 시작일
            </label>
            <input
              id="activity_start_date"
              type="date"
              value={
                filters.activity_start_date
                  ? filters.activity_start_date.toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  activity_start_date: e.target.value
                    ? new Date(e.target.value)
                    : undefined,
                }))
              }
              className="flex h-10 w-full rounded-full border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* 활동 종료일 */}
          <div className="flex items-center gap-2 mt-3">
            <label
              htmlFor="activity_end_date"
              className={"w-22 flex-shrink-0 text-md font-semibold"}
            >
              활동 종료일
            </label>
            <input
              id="activity_end_date"
              type="date"
              value={
                filters.activity_end_date
                  ? filters.activity_end_date.toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  activity_end_date: e.target.value
                    ? new Date(e.target.value)
                    : undefined,
                }))
              }
              className="flex h-10 w-full rounded-full border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* 사진 업로드 */}
          <div className="flex items-center gap-2 mt-3">
            <label
              htmlFor="photo"
              className={"w-22 flex-shrink-0 text-md font-semibold"}
            >
              사진
            </label>
            <input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="flex h-10 w-full rounded-full border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
        <DialogFooter className="flex flex-col gap-2 mt-4">
          {isUploading && (
            <div className="w-full text-center text-sm text-gray-600">
              {uploadProgress}
            </div>
          )}
          <div className="flex flex-row justify-between w-full gap-2">
            <Button
              onClick={() => handleClear()}
              className="w-1/2"
              disabled={isUploading}
            >
              초기화
            </Button>
            <Button
              onClick={() => handleSaveImage()}
              className="w-1/2"
              disabled={isUploading}
            >
              {isUploading ? "처리 중..." : "저장"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
