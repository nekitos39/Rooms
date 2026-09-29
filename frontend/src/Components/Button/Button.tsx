// src/components/Button/Button.tsx

// Подключаем ранее упомянутую библиотеку clsx
import clsx from "clsx";
// Импорт CSS-модуля даёт объект "s" со свойствами-классами (s.button, s.primary
import s from "./Button.module.css";

import { type ComponentPropsWithoutRef } from "react";

type ButtonVariant = "primary" | "secondary";
/** Допустимые размеры кнопки. */
type ButtonSize = "sm" | "md" | "lg";

type NativeButtonProps = ComponentPropsWithoutRef<"button">;

interface ButtonProps extends NativeButtonProps{
    variant?: ButtonVariant;
    size?: ButtonSize;
}

export function Button({
 children, // children указываем явно, используется при
 variant = "primary", // вариант по умолчанию
 size = "md", // размер по умолчанию
 type = "button", // по умолчанию button, но можем переопределить на
 ...rest // ← onClick, disabled, aria-*, data-* и т.д.
}: ButtonProps) {
 return (
 <button type={type}
 {...rest} // вставляем все остальные явно неупомянутые
 className={clsx( // Объединяем набор из нескольких стилей для кнопки
 s.button,
 s[variant], // s.primary или s.secondary
 s[size], // s.sm, s.md или s.lg
 rest.disabled && s.disabled,
 rest.className
 )}
 >
 {children}
 </button>
 );

}
