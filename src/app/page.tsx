"use client";

import { useState } from "react";
import {
  SismoConnectButton,
  SismoConnectConfig,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-react";
import {
  appId,
  auths,
  claims,
  signature,
  vaultConfig,
} from "../../sismo-connect-config";
import { User } from "../types";

const sismoConnectConfig: SismoConnectConfig = {
  appId: appId,
  vault: vaultConfig,
};

export default function Home() {
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const isConnected = Boolean(user);

  async function signIn(response: SismoConnectResponse) {
    setLoading(true);
    try {
      const body = {
        response,
      };
      const res = await fetch("/api/sign-in", {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const error = await res.json();
        console.error(error);
        return;
      }
      const user: User = await res.json();
      setUser(user);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="main">
      {!isConnected && (
        <>
          <h1>
            <b> Sismo Connect Starter</b>
            <br />
            Offchain example
          </h1>
          <p className="introduction">
            Welcome! This starter provides a comprehensive example of account
            connection management using Sismo Connect.{" "}
          </p>
          <p className="introduction">
            Get started by editing{" "}
            <span className="code">/src/app/page.tsx</span>
          </p>
          <SismoConnectButton
            config={sismoConnectConfig}
            auths={auths}
            claims={claims}
            // we ask the user to sign a message
            signature={signature}
            onResponse={(response: SismoConnectResponse) => {
              signIn(response);
            }}
            verifying={loading}
            overrideStyle={{
              width: 250,
              marginTop: 30,
            }}
          />
        </>
      )}
      {isConnected && (
        <>
          <h1>
            <b>Your account</b>
          </h1>
          {user && (
            <table id="user-table">
              <tbody>
                <tr>
                  <th>UserId</th>
                  <td>{user.id}</td>
                </tr>
                <tr>
                  <th>Gitcoin score</th>
                  <td>{user.gitcoinScore}</td>
                </tr>
                <tr>
                  <th>Sismo contributor level</th>
                  <td>{user.sismoContributorLevel}</td>
                </tr>
                <tr>
                  <th>Is Lens follower</th>
                  <td>
                    {user.isSismoLensFollower !== undefined
                      ? user.isSismoLensFollower
                        ? "Yes"
                        : "No"
                      : "Not shared"}
                  </td>
                </tr>
                <tr>
                  <th>EVM Account</th>
                  <td>{user.address ?? "Not shared"}</td>
                </tr>
                <tr>
                  <th>Twitter Id</th>
                  <td>{user.twitterId ?? "Not shared"}</td>
                </tr>
                <tr>
                  <th>Github Id</th>
                  <td>{user.githubId ?? "Not shared"}</td>
                </tr>
                <tr>
                  <th>Telegram Id</th>
                  <td>{user.telegramId ?? "Not shared"}</td>
                </tr>
              </tbody>
            </table>
          )}
          <button
            className="disconnect"
            onClick={() =>
              (window.location.href =
                window.location.origin + window.location.pathname)
            }
          >
            Disconnect
          </button>
        </>
      )}
    </main>
  );
}
