import {FormEvent, useState} from "react";
import {useLocation, useNavigate, Link} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {signIn, selectAuthError, selectAuthLoading} from "../../features/auth/authSlice";
import "./LoginPage.css";

import {Card} from "../../ui/Card";
import {TextField} from "../../ui/TextField";
import {Button} from "../../ui/Button";
import {FormError} from "../../ui/FormError";

export function LoginPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as any)?.from?.pathname || "/maps";

    const isLoading = useAppSelector(selectAuthLoading);
    const error = useAppSelector(selectAuthError);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        const action = await dispatch(signIn({email, password}));
        if (signIn.fulfilled.match(action)) {
            navigate(from, {replace: true});
        }
    }

    return (
        <div className="loginPage">
            <Card as="form" onSubmit={onSubmit} title="Sign In">
                <TextField
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                />

                <TextField
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    required
                />

                <FormError message={error}/>

                <Button type="submit" disabled={isLoading} loading={isLoading} loadingText="Signing in...">
                    Sign in
                </Button>

                <div className="loginLinks">
                    <span className="loginLinksText">Don't have an account yet?</span>
                    <Link className="loginLink" to="/register">
                        Sign Up
                    </Link>
                </div>
            </Card>
        </div>
    );
}
