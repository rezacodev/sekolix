import * as React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface NumberInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> {
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, value, onChange, min, max, step = 1, ...props }, ref) => {
    const handleIncrement = () => {
      if (value === null) {
        onChange(min !== undefined ? min : 0);
      } else {
        const newValue = value + step;
        if (max === undefined || newValue <= max) {
          onChange(newValue);
        }
      }
    };

    const handleDecrement = () => {
      if (value === null) {
        onChange(min !== undefined ? min : 0);
      } else {
        const newValue = value - step;
        if (min === undefined || newValue >= min) {
          onChange(newValue);
        }
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      if (inputValue === "") {
        onChange(null);
      } else {
        const numValue = Number(inputValue);
        if (!isNaN(numValue)) {
          if (min !== undefined && numValue < min) {
            onChange(min);
          } else if (max !== undefined && numValue > max) {
            onChange(max);
          } else {
            onChange(numValue);
          }
        }
      }
    };

    const handleBlur = () => {
      if (value !== null) {
        if (min !== undefined && value < min) {
          onChange(min);
        } else if (max !== undefined && value > max) {
          onChange(max);
        }
      }
    };

    return (
      <div className="relative">
        <Input
          type="number"
          className={cn("pr-8", className)}
          value={value === null ? "" : value}
          onChange={handleChange}
          onBlur={handleBlur}
          min={min}
          max={max}
          step={step}
          {...props}
          ref={ref}
        />
        <div className="absolute right-0 top-0 flex flex-col h-full">
          <button
            type="button"
            className="p-1 hover:bg-accent rounded-t-sm"
            onClick={handleIncrement}
            aria-label="Increase"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            className="p-1 hover:bg-accent rounded-b-sm"
            onClick={handleDecrement}
            aria-label="Decrease"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }
);

NumberInput.displayName = "NumberInput";

export { NumberInput };
