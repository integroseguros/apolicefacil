"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "./input"
import { Label } from "./label"
import {
    formatDocument,
    validateDocument,
    cleanDocument
} from "@/utils/document-validators"

export interface DocumentInputProps {
    /** The person type that determines document format (CPF for PF, CNPJ for PJ) */
    personType: 'PF' | 'PJ'
    /** Current document value */
    value: string
    /** Callback when document value changes */
    onChange: (value: string) => void
    /** Error message to display */
    error?: string
    /** Whether the input is disabled */
    disabled?: boolean
    /** Whether the field is required */
    required?: boolean
    /** Additional CSS classes */
    className?: string
    /** Input placeholder text */
    placeholder?: string
    /** Input name attribute */
    name?: string
    /** Input id attribute */
    id?: string
    /** Callback when input loses focus */
    onBlur?: () => void
}

const DocumentInput = React.forwardRef<HTMLInputElement, DocumentInputProps>(
    ({
        personType,
        value,
        onChange,
        error,
        disabled = false,
        required = false,
        className,
        placeholder,
        name,
        id,
        onBlur,
        ...props
    }, ref) => {
        const [isFocused, setIsFocused] = React.useState(false)
        const [hasBeenBlurred, setHasBeenBlurred] = React.useState(false)

        // Determine document type and properties based on person type
        const documentType = personType === 'PF' ? 'CPF' : 'CNPJ'
        const maxLength = documentType === 'CPF' ? 14 : 18 // Formatted length
        const inputPlaceholder = placeholder || (documentType === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00')
        const labelText = documentType === 'CPF' ? 'CPF' : 'CNPJ'

        // Validation state
        const cleanedValue = cleanDocument(value)
        const isComplete = cleanedValue.length === (documentType === 'CPF' ? 11 : 14)
        const isValid = isComplete ? validateDocument(value, documentType) : true
        const showError = error || (hasBeenBlurred && isComplete && !isValid)
        const errorMessage = error || (isComplete && !isValid ? `${documentType} inválido` : '')

        // Handle input change with real-time formatting
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value
            const formatted = formatDocument(inputValue, documentType)
            onChange(formatted)
        }

        // Handle focus events
        const handleFocus = () => {
            setIsFocused(true)
        }

        const handleBlur = () => {
            setIsFocused(false)
            setHasBeenBlurred(true)
            onBlur?.()
        }

        // Handle keyboard navigation
        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            // Allow navigation keys, backspace, delete, tab
            const allowedKeys = [
                'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                'Home', 'End', 'Tab', 'Backspace', 'Delete',
                'Enter', 'Escape'
            ]

            // Allow digits
            const isDigit = /^\d$/.test(e.key)

            // Allow Ctrl/Cmd combinations (copy, paste, etc.)
            const isCtrlCmd = e.ctrlKey || e.metaKey

            if (!isDigit && !allowedKeys.includes(e.key) && !isCtrlCmd) {
                e.preventDefault()
            }
        }

        // Generate unique IDs if not provided
        const inputId = id || `document-input-${documentType.toLowerCase()}`
        const errorId = `${inputId}-error`

        return (
            <div className={cn("space-y-2", className)}>
                <Label
                    htmlFor={inputId}
                    className={cn(
                        "text-sm font-medium",
                        showError && "text-destructive",
                        disabled && "opacity-50"
                    )}
                >
                    {labelText}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>

                <div className="relative">
                    <Input
                        ref={ref}
                        id={inputId}
                        name={name}
                        type="text"
                        value={value}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        placeholder={inputPlaceholder}
                        maxLength={maxLength}
                        disabled={disabled}
                        required={required}
                        aria-invalid={showError ? 'true' : 'false'}
                        aria-describedby={showError ? errorId : undefined}
                        className={cn(
                            "transition-colors",
                            showError && "border-destructive focus-visible:ring-destructive",
                            isComplete && isValid && "border-green-500 focus-visible:ring-green-500",
                            isFocused && "ring-2 ring-ring ring-offset-2"
                        )}
                        {...props}
                    />

                    {/* Validation indicator */}
                    {isComplete && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {isValid ? (
                                <svg
                                    data-testid="validation-success"
                                    className="h-4 w-4 text-green-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    data-testid="validation-error"
                                    className="h-4 w-4 text-destructive"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            )}
                        </div>
                    )}
                </div>

                {/* Error message */}
                {showError && (
                    <p
                        id={errorId}
                        className="text-sm text-destructive"
                        role="alert"
                        aria-live="polite"
                    >
                        {errorMessage}
                    </p>
                )}

                {/* Helper text when focused and not complete */}
                {isFocused && !isComplete && !showError && (
                    <p className="text-sm text-muted-foreground">
                        Digite {cleanedValue.length}/{documentType === 'CPF' ? '11' : '14'} dígitos
                    </p>
                )}
            </div>
        )
    }
)

DocumentInput.displayName = "DocumentInput"

export { DocumentInput }