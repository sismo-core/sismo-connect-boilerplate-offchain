"use client";

import styles from "./page.module.css";
import { useState } from "react";
import {
  SismoConnectButton,
  SismoConnectResponse,
  SismoConnectVerifiedResult,
} from "@sismo-core/sismo-connect-react";

import {
  CONFIG,
  AUTHS,
  CLAIMS,
  SIGNATURE_REQUEST,
  AuthType,
  ClaimType,
} from "./sismo-connect-config";

export default function Home() {
  const [sismoConnectVerifiedResult, setSismoConnectVerifiedResult] =
    useState<SismoConnectVerifiedResult>();
  const [verifyState, setVerifyState] = useState<string>("init");
  /* ***********************  Application states *************************** */
  return (
    <>
      <main className={styles.main}>
        <h1>
          <b> Sismo Connect Starter: offchain app with Next.js</b>
        </h1>
        <h3>
          <a href="https://docs.sismo.io"> Read the docs | </a>{" "}
          <a href="https://builders.sismo.io"> Join the Telegram Builders Group </a>{" "}
        </h3>
        <p>
          1. The frontend requests ZK Proofs via Sismo Connect Button <br />
          2. The user generates ZK Proofs in their Data Vault and sends the Sismo Connect response
          to the frontend <br />
          3. The frontend forwards the response to the backend via the verify API route <br />
          4. The backend verifies the proofs contained in the response and sends the result back to
          the frontend <br />
          5. The frontend displays the Sismo Connect requests and verified result
        </p>
        <>
          <p>
            <b className="code-snippet">src/app/sismo-connect-config.ts</b>: Sismo Connect
            configuration and requests
          </p>
          <p>
            <b className="code-snippet">src/app/page.tsx</b>: Frontend - make Sismo Connect request
          </p>
          <p>
            <b className="code-snippet">src/api/verify/route.ts</b>: Backend - verify Sismo Connect
            request
          </p>
          {verifyState == "init" ? (
            <>
              <SismoConnectButton
                config={CONFIG}
                // Auths = Data Source Ownership Requests
                auths={AUTHS}
                // Claims = prove groump membership of a Data Source in a specific Data Group.
                // Data Groups = [{[dataSource1]: value1}, {[dataSource1]: value1}, .. {[dataSource]: value}]
                // When doing so Data Source is not shared to the app.
                claims={CLAIMS}
                // we ask the user to sign a message
                signature={SIGNATURE_REQUEST}
                text="Prove With Sismo"
                // onResponseBytes calls a 'setResponse' function with the responseBytes returned by the Sismo Vault
                onResponse={async (response: SismoConnectResponse) => {
                  setVerifyState("verifying");
                  const verifiedResult = await fetch("/api/verify", {
                    method: "POST",
                    body: JSON.stringify(response),
                  });
                  setSismoConnectVerifiedResult(await verifiedResult.json());
                  setVerifyState("verified");
                }}
              />
              <p className="callout">
                {" "}
                Notes: <br />
                1. First ZK Proof generation takes longer time, especially with bad internat as
                there is a zkey file to download once in the data vault connection <br />
                2. The more proofs you request, the longer it takes to generate them (about 2 secs
                per proof)
              </p>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  window.location.href = "/";
                }}
              >
                {" "}
                RESET{" "}
              </button>
              <br></br>
              <p>{verifyState == "verifying" ? "Verifying ZK Proofs..." : "ZK Proofs verified!"}</p>
            </>
          )}
          <h3>Auths requested and verified</h3>
          <table>
            <thead>
              <tr>
                <th>Authentication Requests</th>
                <th>AuthType</th>
                <th>Requested UserId</th>
                <th>Is Optional?</th>
                <th>Verified UserId</th>
              </tr>
            </thead>
            <tbody>
              {AUTHS.map((auth, index) => (
                <tr key={index}>
                  <td>Requested Auth #{index + 1}</td>
                  <td>{AuthType[auth.authType]}</td>
                  <td>{readibleUserId(auth.userId || "No userId requested")}</td>
                  <td>{auth.isOptional ? "yes" : "no"}</td>
                  {sismoConnectVerifiedResult ? (
                    <td>
                      {sismoConnectVerifiedResult.auths.filter(
                        (verifiedAuth) => verifiedAuth.authType == auth.authType
                      ).length > 0
                        ? sismoConnectVerifiedResult.auths
                            .filter((verifiedAuth) => verifiedAuth.authType == auth.authType)
                            .map((verifiedAuth) => readibleUserId(verifiedAuth.userId!))
                        : "Not Proved"}
                    </td>
                  ) : (
                    <td> ZK Proofs not verified yet </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <br />
          <h3>Claims requested and verified</h3>
          <table>
            <thead>
              <tr>
                <th>Claim</th>
                <th>GroupId</th>
                <th>Is Selectable By User?</th>
                <th>Is Optional?</th>
                <th>Requested Value</th>
                <th>ClaimType</th>
                <th>Verified Value</th>
              </tr>
            </thead>
            <tbody>
              {CLAIMS.map((claim, index) => (
                <tr key={index}>
                  <td>Requested Claim #{index + 1}</td>
                  <td>
                    <a
                      target="_blank"
                      href={"https://factory.sismo.io/groups-explorer?search=" + claim.groupId}
                    >
                      {claim.groupId}
                    </a>
                  </td>
                  <td>{claim.isSelectableByUser ? "yes" : "no"}</td>
                  <td>{claim.isOptional ? "yes" : "no"}</td>
                  <td>{claim.value ? claim.value : "1"}</td>
                  <td>{ClaimType[claim.claimType || "1"]}</td>
                  {sismoConnectVerifiedResult ? (
                    <td>
                      {sismoConnectVerifiedResult.claims.filter(
                        (verifiedClaim) =>
                          verifiedClaim.groupId == claim.groupId &&
                          verifiedClaim.claimType == claim.claimType
                      ).length > 0
                        ? sismoConnectVerifiedResult.claims
                            .filter(
                              (verifiedClaim) =>
                                verifiedClaim.groupId == claim.groupId &&
                                verifiedClaim.claimType == claim.claimType
                            )
                            .map((verifiedClaim) => verifiedClaim.value)
                        : "Not Proved"}
                    </td>
                  ) : (
                    <td> ZK Proofs not verified yet </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      </main>
    </>
  );
}

function readibleUserId(userId: string, startLength = 6, endLength = 4, separator = "...") {
  if (!userId.startsWith("0x")) {
    return userId; // Return the original string if it doesn't start with "0x"
  }
  return userId.substring(0, startLength) + separator + userId.substring(userId.length - endLength);
}
