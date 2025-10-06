import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  options: SelectOption[];
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  value?: string;
  onValueChange?: (value: string) => void;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    placeholder,
    options,
    variant = 'default', 
    size = 'md',
    value,
    onValueChange,
    id,
    ...props 
  }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    const baseStyles = 'w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 appearance-none cursor-pointer';
    
    const variantStyles = {
      default: 'border-neutral-300 dark:border-neutral-700',
      filled: 'border-transparent bg-neutral-100 dark:bg-neutral-800',
      outlined: 'border-2 border-neutral-300 dark:border-neutral-600'
    };

    const sizeStyles = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-5 py-4 text-lg'
    };

    const errorStyles = error ? 'border-red-500 dark:border-red-400 focus:ring-red-500' : '';

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onValueChange) {
        onValueChange(e.target.value);
      }
      if (props.onChange) {
        props.onChange(e);
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={selectId}
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            value={value}
            onChange={handleChange}
            className={cn(
              baseStyles,
              variantStyles[variant],
              sizeStyles[size],
              errorStyles,
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500 dark:text-neutral-400 pointer-events-none" />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// Additional exports for compatibility with complex Select components
export const SelectTrigger = React.forwardRef<HTMLSelectElement, SelectProps>((props, ref) => (
  <Select ref={ref} {...props} />
));

export const SelectContent = ({ children }: { children: React.ReactNode }) => (
  <div className="select-content">{children}</div>
);

export const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => (
  <option value={value}>{children}</option>
);

export const SelectValue = ({ placeholder }: { placeholder?: string }) => (
  <span className="select-value">{placeholder || 'Select an option'}</span>
);
