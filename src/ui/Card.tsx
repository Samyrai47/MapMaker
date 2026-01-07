import React from "react";

type Props =
    | ({
    as?: "div";
    onSubmit?: never;
} & React.HTMLAttributes<HTMLDivElement>)
    | ({
    as: "form";
    onSubmit: React.FormEventHandler<HTMLFormElement>;
} & React.FormHTMLAttributes<HTMLFormElement>);

type CardProps = Props & {
    title?: string;
    children: React.ReactNode;
};

export function Card({ as = "div", title, children, ...rest }: CardProps) {
    const Component = as as any;

    return (
        <Component className="loginCard" {...rest}>
            {title ? <h1 className="loginTitle">{title}</h1> : null}
            {children}
        </Component>
    );
}
