import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  id: string;
  label: string;
  value?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SelectField({
  id,
  label,
  value,
  options,
  onChange,
  placeholder = "선택하세요",
  className = "",
}: SelectFieldProps) {
  return (
    <div className={`flex items-center gap-2 mt-3 ${className}`}>
      <label htmlFor={id} className="w-22 flex-shrink-0 text-md font-semibold">
        {label}
      </label>
      <div className="relative w-full">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full rounded-full pr-4 text-sm">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
