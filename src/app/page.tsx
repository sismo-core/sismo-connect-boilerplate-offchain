"use client";

import styles from "./page.module.css";
import { useEffect, useState } from "react";
import {
  AuthType,
  ClaimType,
  SismoConnectButton,
  SismoConnectConfig,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-react";

/* ***********************  Sismo Connect Config *************************** */
const sismoConnectConfig: SismoConnectConfig = {
  appId: "0xf4977993e52606cfd67b7a1cde717069",
  vault: {
    // For development purposes insert the identifier that you want to impersonate here
    // Never use this in production
    impersonate: [
      "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      "0x66ee17d0e530fa9dec4eedb2ddd92fc3fcb1528f",
      "github:leosayous21",
      "twitter:dhadrien_:2390703980",
    ],
  },
};

export default function Home() {
  /* ***********************  Application states *************************** */
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [userInput, setUserInput] = useState<string>("");

  function onUserInput(e: React.ChangeEvent<HTMLInputElement>) {
    setUserInput(e.target.value);
    localStorage.setItem("user-input", e.target.value);
  }

  useEffect(() => {
    const storedUserInput = localStorage.getItem("user-input");
    if (storedUserInput) setUserInput(storedUserInput);
  }, []);

  async function onSismoConnectResponse(response: SismoConnectResponse) {
    setLoading(true);

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        body: JSON.stringify(response),
      });
      if (!res.ok) {
        const error = await res.json();
        setError(error);
        return;
      }
      const user = await res.json();
      setUser(user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function resetApp() {
    setUser(null);
    setUserInput("");
    setLoading(false);
    setError(null);
    localStorage.removeItem("user-input");
    const url = new URL(window.location.href);
    url.searchParams.delete("sismoConnectResponseCompressed");
    window.history.replaceState({}, "", url.toString());
  }

  return (
    <>
      <main className={styles.main}>
        <h1>
          <b> Boilerplate</b>
          <br />
          Sismo Connect offchain
        </h1>

        {user && (
          <>
            <p>Verified user: {user.name}</p>
            <p>User id: {user.id}</p>
          </>
        )}

        {!user && (
          <>
            <p>Using Sismo Connect we will authenticate a user:</p>
            <br />
            <ul>
              <li>
                Sybil-resistance: proving a unique gitcoin passport with a score
                above 15
              </li>
              <li>
                Gated: authentication is only available for Sismo Contributors
              </li>
            </ul>
            <br />
            <label>Your name</label>
            <input
              value={userInput}
              onChange={onUserInput}
              disabled={loading}
            />

            <SismoConnectButton
              // the client config created
              config={sismoConnectConfig}
              // the auth request we want to make
              // here we want the proof of a Sismo Vault ownership from our users
              auths={[
                { authType: AuthType.VAULT },
                { authType: AuthType.EVM_ACCOUNT },
              ]}
              claims={[
                // we ask the user to prove that he has a gitcoin passport with a score above 15
                // https://factory.sismo.io/groups-explorer?search=0x1cde61966decb8600dfd0749bd371f12
                {
                  groupId: "0x1cde61966decb8600dfd0749bd371f12",
                  claimType: ClaimType.GTE,
                  value: 15,
                },
                // we ask the user to prove that he is part of the Sismo Contributors group and selectively prove its level
                // https://factory.sismo.io/groups-explorer?search=0xe9ed316946d3d98dfcd829a53ec9822e
                {
                  groupId: "0xe9ed316946d3d98dfcd829a53ec9822e",
                  isSelectableByUser: true,
                },
                // we optionally ask the user to prove that he is following Sismo on Lens
                // https://factory.sismo.io/groups-explorer?search=0xabf3ea8c23ff96893ac5caf4d2fa7c1f
                {
                  groupId: "0xabf3ea8c23ff96893ac5caf4d2fa7c1f",
                  isOptional: true,
                },
              ]}
              // we ask the user to sign a message
              signature={{ message: userInput, isSelectableByUser: true }}
              // onResponseBytes calls a 'setResponse' function with the responseBytes returned by the Sismo Vault
              onResponse={(response: SismoConnectResponse) => {
                onSismoConnectResponse(response);
              }}
              verifying={loading}
            />
          </>
        )}
        {(user || error) && (
          <button className={styles.disconnect} onClick={() => resetApp()}>
            Reset
          </button>
        )}
        {error && <p className={styles.error}>{error}</p>}
      </main>
    </>
  );
}
