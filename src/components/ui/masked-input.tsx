'use client';

import React, { forwardRef } from 'react';
import { Input } from '@/components/ui/input'; // Assumindo que você usa Shadcn UI
import { cn } from '@/lib/utils'; // Assumindo que você usa utilitários Shadcn

interface MaskedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Removendo a prop 'mask' fixa, pois ela será inferida internamente
  // Não precisamos de uma 'mask' string aqui, ela será dinâmica
}

const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ value, onChange, className, ...props }, ref) => {

    const getPhoneMask = (numericValue: string): string => {
      // DDD + 9 dígitos (celular) = 11 dígitos no total
      if (numericValue.length > 10) {
        return '(99) 99999-9999'; // Máscara de celular
      }
      // DDD + 8 dígitos (fixo) = 10 dígitos no total ou menos (para preenchimento)
      return '(99) 9999-9999'; // Máscara de fixo (padrão)
    };

    const applyPhoneMask = (inputValue: string): string => {
      if (!inputValue) return '';

      const numericValue = inputValue.replace(/\D/g, '');
      const maskPattern = getPhoneMask(numericValue);

      let maskedValue = '';
      let numericIndex = 0;

      for (let i = 0; i < maskPattern.length; i++) {
        if (numericIndex >= numericValue.length) {
          // Parar de aplicar a máscara se não houver mais dígitos para preencher
          break;
        }

        if (maskPattern[i] === '9') {
          maskedValue += numericValue[numericIndex];
          numericIndex++;
        } else {
          maskedValue += maskPattern[i];
        }
      }

      return maskedValue;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const maskedValue = applyPhoneMask(inputValue);

      // Create a new event with the masked value
      const maskedEvent = {
        ...e,
        target: {
          ...e.target,
          value: maskedValue,
        },
      };

      onChange?.(maskedEvent as React.ChangeEvent<HTMLInputElement>);
    };

    // Certifica-se de que `value` é uma string antes de aplicar a máscara
    const displayValue = typeof value === 'string' ? applyPhoneMask(value) : '';

    return (
      <Input
        {...props}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        className={cn(className)}
        maxLength={15} // Define o tamanho máximo para (XX) XXXXX-XXXX
      />
    );
  }
);

MaskedInput.displayName = 'MaskedInput';

export { MaskedInput };