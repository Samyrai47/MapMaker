import React from "react";

type Props = { message?: string | null };

export function FormError({ message }: Props) {
    if (!message) return null;
    return (
        <div className="loginError" role="alert">
            {message}
        </div>
    );
}
