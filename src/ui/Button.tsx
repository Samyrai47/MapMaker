import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    loading?: boolean;
    loadingText?: string;
};

export function Button({ loading, loadingText = "Loading...", children, disabled, ...rest }: Props) {
    const isDisabled = Boolean(disabled || loading);
    return (
        <button className="loginButton" disabled={isDisabled} {...rest}>
            {loading ? loadingText : children}
        </button>
    );
}
