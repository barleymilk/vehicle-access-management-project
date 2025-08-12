"use client";

import { useState, useEffect } from "react";
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
import { PeopleFilters } from "@/app/people/page";
import { addPersonToSupabase } from "@/hooks/useSupabase";
import { uploadImageToSupabase } from "@/hooks/useSupabase";

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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const handleSaveImage = async () => {
    try {
      setIsUploading(true);
      setUploadProgress("데이터 검증 중...");

      const photo_path = filters.photo_path;
      let photoUrl = null;

      if (photo_path instanceof File) {
        setUploadProgress("이미지 업로드 중...");
        console.log("이미지 업로드 시작:", photo_path.name, photo_path.size);

        if (photo_path.size > 5 * 1024 * 1024) {
          throw new Error("이미지 파일 크기가 5MB를 초과합니다.");
        }

        if (!photo_path.type.startsWith("image/")) {
          throw new Error("올바른 이미지 파일이 아닙니다.");
        }

        photoUrl = await uploadImageToSupabase(photo_path, "profile");
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
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFilters((prev) => ({ ...prev, photo_path: file }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>사람 정보 추가</DialogTitle>
          <DialogDescription>
            새로운 사람의 정보를 입력하세요.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <InputField
            label="이름"
            value={filters.name || ""}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="이름을 입력하세요"
          />
          <InputField
            label="전화번호"
            value={filters.phone || ""}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, phone: e.target.value }))
            }
            placeholder="전화번호를 입력하세요"
          />
          <InputField
            label="이메일"
            type="email"
            value={filters.email || ""}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="이메일을 입력하세요"
          />
          <InputField
            label="주소"
            value={filters.address || ""}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, address: e.target.value }))
            }
            placeholder="주소를 입력하세요"
          />
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <label
              htmlFor="photo"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              사진
            </label>
            <input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
        <DialogFooter className="flex flex-col gap-2 mt-4">
          {isUploading && (
            <div className="w-full text-center text-sm text-gray-600">
              {uploadProgress}
            </div>
          )}
          <div className="flex flex-row justify-between w-full">
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
