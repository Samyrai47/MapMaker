import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { resetAuthError, selectAuthError, selectAuthLoading, signUp } from "../../features/auth/authSlice";
import "../LoginPage/LoginPage.css";

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

        const action = await dispatch(signUp({ email, password }));
        if (signUp.fulfilled.match(action)) {
            navigate("/login", { replace: true });
        }
    }

    return (
        <div className="loginPage">
            <form className="loginCard" onSubmit={onSubmit}>
                <h1 className="loginTitle">Sign Up</h1>

                <label className="loginField">
                    <span className="loginLabelText">Email</span>
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

                <label className="loginField">
                    <span className="loginLabelText">Password</span>
                    <input
                        className="loginInput"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        required
                    />
                </label>

                <label className="loginField">
                    <span className="loginLabelText">Repeat Password</span>
                    <input
                        className="loginInput"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        type="password"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        required
                    />
                </label>

                {error && (
                    <div className="loginError" role="alert">
                        {error}
                    </div>
                )}

                <button className="loginButton" type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Sign Up"}
                </button>

                <div className="registerLinks">
                    <span className="registerLinksText">Already have an account?</span>
                    <Link className="registerLink" to="/login">
                        Sign In
                    </Link>
                </div>
            </form>
        </div>
    );
}
