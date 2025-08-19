import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface InputFieldProps {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  type?: "text" | "number" | "email" | "tel" | "password";
  disabled?: boolean;
  required?: boolean;
  onChange?: (value: string) => void;
  onClear?: () => void;
}

export const InputField = ({
  id,
  label,
  value = "",
  placeholder = "",
  type = "text",
  required = false,
  disabled = false,
  onChange,
  onClear,
}: InputFieldProps) => {
  return (
    <div className="flex gap-2 mt-3">
      <Label
        htmlFor={id}
        className={`w-22 flex-shrink-0 text-md font-semibold ${
          disabled ? "text-gray-400" : ""
        }`}
      >
        {label}
        {required && "*"}
      </Label>
      <div className="relative w-full">
        <Input
          type={type}
          id={id}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          className="rounded-full pr-12 text-sm placeholder:text-gray-400"
          onChange={(e) => {
            onChange?.(e.target.value);
          }}
        />
        {value && !disabled && (
          <Button
            variant="ghost"
            className="absolute right-2 top-0 h-full rounded-full"
            onClick={onClear}
            tabIndex={-1}
          >
            <X />
          </Button>
        )}
      </div>
    </div>
  );
};
