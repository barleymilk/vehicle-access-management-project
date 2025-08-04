import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useState, useEffect } from "react";
import { getPhotoPath } from "@/hooks/useSupabase";

// 필드 정의 인터페이스
interface FieldDefinition {
  key: string;
  label: string;
  type?: "text" | "date" | "datetime" | "phone" | "email";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: any) => React.ReactNode;
}

interface DetailModalProps {
  open: boolean;
  onCancel: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  title?: string;
  description?: string;
  fields: FieldDefinition[];
  onEdit?: () => void;
  showEditButton?: boolean;
  // photoPath?: string;
  showPhoto?: boolean;
  basicPhotoPath?: string;
  photoShape?: "circle" | "square";
}

export default function DetailModal({
  open,
  onCancel,
  data,
  title = "상세 정보",
  description = "선택된 항목의 상세 정보입니다.",
  fields,
  onEdit,
  showEditButton = false,
  // photoPath,
  showPhoto = false,
  basicPhotoPath = "/user.webp",
  photoShape = "circle",
}: DetailModalProps) {
  const [imageSrc, setImageSrc] = useState<string>(basicPhotoPath);
  const [imageLoading, setImageLoading] = useState(false);

  // 이미지 URL 가져오기
  useEffect(() => {
    const loadImage = async () => {
      if (!showPhoto || !data?.photo_path) {
        setImageSrc(basicPhotoPath);
        return;
      }

      try {
        setImageLoading(true);
        const photoPath = await getPhotoPath(data.photo_path);
        setImageSrc(photoPath || basicPhotoPath);
      } catch (error) {
        console.error("이미지 로드 실패:", error);
        setImageSrc(basicPhotoPath);
      } finally {
        setImageLoading(false);
      }
    };

    loadImage();
  }, [data?.photo_path, showPhoto, basicPhotoPath]);

  if (!data) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatValue = (value: any, field: FieldDefinition) => {
    if (field.render) {
      return field.render(value);
    }

    if (value === null || value === undefined || value === "") {
      return "-";
    }

    switch (field.type) {
      case "date":
        return new Date(value).toLocaleDateString();
      case "datetime":
        return new Date(value).toLocaleString();
      case "phone":
        // 전화번호 포맷팅 (010-1234-5678)
        const phone = String(value).replace(/[^0-9]/g, "");
        if (phone.length === 11) {
          return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
        }
        return value;
      case "email":
        return value;
      default:
        return String(value);
    }
  };

  const renderFields = () => {
    const midPoint = Math.ceil(fields.length / 2);
    const leftFields = fields.slice(0, midPoint);
    const rightFields = fields.slice(midPoint);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="space-y-3">
          {leftFields.map((field) => (
            <div key={field.key} className="bg-[var(--muted)] p-2 rounded-md">
              <label className="font-semibold text-sm text-gray-600">
                {field.label}
              </label>
              <p className="text-sm">{formatValue(data[field.key], field)}</p>
            </div>
          ))}
        </div>
        {rightFields.length > 0 && (
          <div className="space-y-3">
            {rightFields.map((field) => (
              <div key={field.key} className="bg-[var(--muted)] p-2 rounded-md">
                <label className="font-semibold text-sm text-gray-600">
                  {field.label}
                </label>
                <p className="text-sm">{formatValue(data[field.key], field)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderPhoto = () => {
    if (!showPhoto) return null;

    return (
      <div className="flex justify-center">
        <div
          className={`relative w-30 h-30 ${
            photoShape === "circle"
              ? "rounded-full border-2 border-gray-200"
              : "w-full h-40"
          } overflow-hidden`}
        >
          {imageLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-sm text-gray-500">로딩 중...</div>
            </div>
          ) : (
            <Image
              src={imageSrc}
              alt="프로필 이미지"
              fill
              className="object-cover"
              onError={(e) => {
                // 이미지 로드 실패 시 기본 이미지로 대체
                const target = e.target as HTMLImageElement;
                target.src = basicPhotoPath;
              }}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {renderPhoto()}
        {renderFields()}

        <DialogFooter className="mt-6 flex flex-row justify-between">
          {showEditButton && onEdit && (
            <Button onClick={onEdit} className="w-1/2 bg-[var(--point)]">
              수정
            </Button>
          )}
          <Button
            onClick={onCancel}
            className={showEditButton && onEdit ? "w-1/2" : "w-full"}
            variant="outline"
          >
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
