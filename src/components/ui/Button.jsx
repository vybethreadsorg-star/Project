import React from 'react'
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function Button({
    className,
    variant = "primary",
    color = "pink",
    children,
    ...props
}) {
    const variants = {
        primary: color === "pink" ? "cyber-button-primary" : "cyber-button-cyan",
        outline: "cyber-button",
        ghost: "bg-transparent text-white hover:text-cyber-pink transition-colors uppercase text-xs tracking-widest font-cyber"
    }

    return (
        <button
            className={twMerge(variants[variant], className)}
            {...props}
        >
            <span className="relative z-10">{children}</span>
        </button>
    )
}
