"use client";

import { useState, useEffect } from "react";

export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T) => void] {
    const [storedValue, setStoredValue] = useState<T>(initialValue);

    useEffect(() => {
        // This part runs only on the client
        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                setStoredValue(JSON.parse(item));
            } else {
                window.localStorage.setItem(key, JSON.stringify(initialValue));
            }
        } catch (error) {
            console.log(error);
            // Fallback to initialValue and reset localStorage
            window.localStorage.setItem(key, JSON.stringify(initialValue));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    const setValue = (value: T) => {
        try {
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== "undefined") {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.log(error);
        }
    };

    return [storedValue, setValue];
}
