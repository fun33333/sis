"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface MultiSelectFilterProps {
  title: string
  options: string[] | number[]
  selectedValues: (string | number)[]
  onSelectionChange: (values: (string | number)[]) => void
  placeholder?: string
}

export function MultiSelectFilter({
  title,
  options,
  selectedValues,
  onSelectionChange,
  placeholder = "Select options...",
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false)

  const handleToggleOption = (option: string | number) => {
    const newSelection = selectedValues.includes(option)
      ? selectedValues.filter((item) => item !== option)
      : [...selectedValues, option]
    onSelectionChange(newSelection)
  }

  const handleSelectAll = () => {
    if (selectedValues.length === options.length) {
      onSelectionChange([])
    } else {
      onSelectionChange([...options])
    }
  }

  const displayText =
    selectedValues.length === 0
      ? placeholder
      : selectedValues.length === 1
        ? String(selectedValues[0])
        : `${selectedValues.length} selected`

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{title}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-white dark:bg-[#ffffff]"
          >
            <span className="truncate">{displayText}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="p-2 space-y-2">
            <div className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm">
              <Checkbox
                id="select-all"
                checked={selectedValues.length === options.length}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                Select All
              </label>
            </div>
            <div className="border-t pt-2 max-h-64 overflow-y-auto">
              {options.map((option) => (
                <div
                  key={option}
                  className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                  onClick={() => handleToggleOption(option)}
                >
                  <Checkbox
                    id={`option-${option}`}
                    checked={selectedValues.includes(option)}
                    onCheckedChange={() => handleToggleOption(option)}
                  />
                  <label htmlFor={`option-${option}`} className="text-sm cursor-pointer flex-1">
                    {String(option)}
                  </label>
                  {selectedValues.includes(option) && <Check className="h-4 w-4 text-primary" />}
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedValues.slice(0, 3).map((value) => (
            <Badge key={value} variant="secondary" className="text-xs">
              {String(value)}
            </Badge>
          ))}
          {selectedValues.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{selectedValues.length - 3} more
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
