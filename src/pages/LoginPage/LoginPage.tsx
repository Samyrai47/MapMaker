import {FormEvent, useState} from "react";
import {useLocation, useNavigate, Link} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {signIn, selectAuthError, selectAuthLoading} from "../../features/auth/authSlice";
import "./LoginPage.css";

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
            <form className="loginCard" onSubmit={onSubmit}>
                <h1 className="loginTitle">Sign In</h1>

                <label>
                    <div className="loginLabelText" style={{marginBottom: 6}}>Email</div>
                    <input
                        className="loginInput"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        required
                    />
                </label>

                <div style={{height: 12}}/>

                <label>
                    <div className="loginLabelText" style={{marginBottom: 6}}>Password</div>
                    <input
                        className="loginInput"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        required
                    />
                </label>

                {error && <div className="loginError" role="alert">{error}</div>}

                <button className="loginButton" type="submit" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign in"}
                </button>

                <div className="loginLinks">
                    <span className="loginLinksText">Don't have an account yet?</span>
                    <Link className="loginLink" to="/register">
                        Sign Up
                    </Link>
                </div>
            </form>
        </div>
    );
}
