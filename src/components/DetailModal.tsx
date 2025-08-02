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

// 필드 정의 인터페이스
interface FieldDefinition {
  key: string;
  label: string;
  type?: "text" | "date" | "datetime" | "phone" | "email";
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
}: DetailModalProps) {
  if (!data) return null;

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="space-y-3">
          {leftFields.map((field) => (
            <div key={field.key}>
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
              <div key={field.key}>
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

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

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
