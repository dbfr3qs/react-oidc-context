import * as React from "react";
import * as ReactDOM from "react-dom";
import { User } from "oidc-client-ts";
import { AuthProvider, useAuth, type AuthProviderProps } from "../src/.";

const onSigninCallback = (_user: User | void): void => {
    window.history.replaceState(
        {},
        document.title,
        window.location.pathname,
    );};

const oidcConfig: AuthProviderProps = {
    authority: "https://localhost:5001",
    client_id: "js_oidc",
    redirect_uri: "http://localhost:1234/",
    onSigninCallback: onSigninCallback,
    scope: "openid profile email offline_access",
    monitorSession: true,
    dpopSettings: { enabled: true, bind_authorization_code: true },
};

function App() {
    const auth = useAuth();

    const callApi = async () => {
        try {
            const url = "https://localhost:5005/identity";
            const token = auth.user?.access_token;
            const DPoPProof = await auth.dpopProof(url, auth.user as User);

            const response = await fetch("https://localhost:5005/identity", {
                credentials: "include",
                mode: "cors",
                method: "GET",
                headers: {
                    Authorization: `DPoP ${token}`,
                    DPoP: DPoPProof,
                },
            });
            console.log(await response.json());
        } catch (e) {
            console.error(e);
        }
    };

    if (auth.isLoading) {
        return <div>Loading...</div>;
    }

    if (auth.error) {
        return <div>Oops... {auth.error.message}</div>;
    }

    if (auth.isAuthenticated) {
        return (
            <div>
                Hello {auth.user?.profile.given_name}{" "}{auth.user?.profile.family_name}
                <button onClick={() => void auth.removeUser()}>
                    Log out
                </button>
                <button onClick={() => void callApi()}>Call Api</button>
                <button onClick={() => void auth.signinSilent()}>Use Refresh token</button>
            </div>
        );
    }

    return <button onClick={() => void auth.signinRedirect()}>Log in</button>;
}

ReactDOM.render(
    <AuthProvider {...oidcConfig}>
        <App />
    </AuthProvider>,
    document.getElementById("root"),
);
