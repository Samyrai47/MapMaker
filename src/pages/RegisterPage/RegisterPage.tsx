import {FormEvent, useState} from "react";
import {useNavigate, Link} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {resetAuthError, selectAuthError, selectAuthLoading, signUp} from "../../features/auth/authSlice";
import "../LoginPage/LoginPage.css";

import {Card} from "../../ui/Card";
import {TextField} from "../../ui/TextField";
import {Button} from "../../ui/Button";
import {FormError} from "../../ui/FormError";

export function RegisterPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const isLoading = useAppSelector(selectAuthLoading);
    const error = useAppSelector(selectAuthError);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        dispatch(resetAuthError());

        if (password !== password2) {
            return alert("Passwords don't match");
        }

        const action = await dispatch(signUp({email, password}));
        if (signUp.fulfilled.match(action)) {
            navigate("/login", {replace: true});
        }
    }

    return (
        <div className="loginPage">
            <Card as="form" onSubmit={onSubmit} title="Sign Up">
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
                    autoComplete="new-password"
                    placeholder="••••••••"
                    required
                />

                <TextField
                    label="Repeat Password"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    required
                />

                <FormError message={error}/>

                <Button type="submit" disabled={isLoading} loading={isLoading} loadingText="Creating...">
                    Sign Up
                </Button>

                <div className="registerLinks">
                    <span className="registerLinksText">Already have an account?</span>
                    <Link className="registerLink" to="/login">
                        Sign In
                    </Link>
                </div>
            </Card>
        </div>
    );
}
