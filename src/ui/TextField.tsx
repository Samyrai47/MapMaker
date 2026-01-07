import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
};

export function TextField({ label, ...inputProps }: Props) {
    return (
        <label className="loginField">
            <span className="loginLabelText">{label}</span>
            <input className="loginInput" {...inputProps} />
        </label>
    );
}
