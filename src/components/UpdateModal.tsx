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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addPersonToSupabase } from "@/hooks/useSupabase";
import { uploadImageToSupabase } from "@/hooks/useSupabase";

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
          <div className="flex gap-2 mt-3">
            <label
              htmlFor="vip_level"
              className={`w-22 flex-shrink-0 text-md font-semibold ${
                filters.vip_level ? "text-gray-400" : ""
              }`}
            >
              VIP 레벨
            </label>
            <div className="relative w-full">
              <Select
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    vip_level: value === "none" ? undefined : value,
                  }))
                }
                defaultValue={filters.vip_level || "일반"}
              >
                <SelectTrigger className="w-full rounded-full pr-4 text-sm">
                  <SelectValue placeholder="선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">선택하세요</SelectItem>
                  <SelectItem value="VIP1">VIP1</SelectItem>
                  <SelectItem value="VIP2">VIP2</SelectItem>
                  <SelectItem value="VIP3">VIP3</SelectItem>
                  <SelectItem value="직원">직원</SelectItem>
                  <SelectItem value="대내기관">대내기관</SelectItem>
                  <SelectItem value="외부업체">외부업체</SelectItem>
                  <SelectItem value="단체방문">단체방문</SelectItem>
                  <SelectItem value="일반">일반</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 외부용역 여부 */}
          <div className="flex gap-2 mt-3">
            <label
              htmlFor="is_worker"
              className={`w-22 flex-shrink-0 text-md font-semibold ${
                filters.is_worker ? "text-gray-400" : ""
              }`}
            >
              외부용역
            </label>
            <Select
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  is_worker: value === "none" ? undefined : value === "true",
                }))
              }
              defaultValue={
                filters.is_worker === undefined
                  ? "false"
                  : filters.is_worker.toString()
              }
            >
              <SelectTrigger className="w-full rounded-full pr-4 text-sm">
                <SelectValue placeholder="선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">선택하세요</SelectItem>
                <SelectItem value="false">외부용역 제외</SelectItem>
                <SelectItem value="true">외부용역</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 상태 선택 */}
          <div className="flex gap-2 mt-3">
            <label
              htmlFor="status"
              className={`w-22 flex-shrink-0 text-md font-semibold ${
                filters.status ? "text-gray-400" : ""
              }`}
            >
              상태
            </label>
            <Select
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  status: value === "none" ? undefined : value,
                }))
              }
              defaultValue={filters.status || "active"}
            >
              <SelectTrigger className="w-full rounded-full pr-4 text-sm">
                <SelectValue placeholder="선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">선택하세요</SelectItem>
                <SelectItem value="active">활성</SelectItem>
                <SelectItem value="inactive">비활성</SelectItem>
                <SelectItem value="blocked">차단</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 활동 시작일 */}
          <div className="flex gap-2 mt-3">
            <label
              htmlFor="activity_start_date"
              className={`w-22 flex-shrink-0 text-md font-semibold ${
                filters.activity_start_date ? "text-gray-400" : ""
              }`}
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
          <div className="flex gap-2 mt-3">
            <label
              htmlFor="activity_end_date"
              className={`w-22 flex-shrink-0 text-md font-semibold ${
                filters.activity_end_date ? "text-gray-400" : ""
              }`}
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
          <div className="flex gap-2 mt-3">
            <label
              htmlFor="photo"
              className={`w-22 flex-shrink-0 text-md font-semibold ${
                selectedFile ? "text-gray-400" : ""
              }`}
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
