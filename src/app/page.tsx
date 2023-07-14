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
          <b> Sismo Connect Offchain Starter</b>
        </h1>
        <h3>A Next.js starter repository for Sismo Connect offchain Apps</h3>
        <h3>
          <a href="https://docs.sismo.io"> Read the docs!</a>{" "}
        </h3>
        <br />
        <br />

        <>
          <p>
            Using Sismo Connect we are requesting ZK Proofs from users and verify them. Here we are
            requesting many ZK Proofs, so generation time is long, especially the firs time.
          </p>
          <p></p>
          <p>
            Feel free to delete or update auths and claims requests in{" "}
            <b>src/app/sismo-connect-config.ts</b>{" "}
          </p>
          {verifyState == "init" ? (
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
          ) : (
            <>
              <br></br>
              <br></br>
              <br></br>
              <p>{verifyState == "verifying" ? "Verifying ZK Proofs..." : "ZK Proofs verified!"}</p>
              <br></br>
              <br></br>
            </>
          )}
          <h3>Auths requested and verified</h3>
          <table>
            <thead>
              <tr>
                <th>Auth</th>
                <th>AuthType</th>
                <th>Requested UserId</th>
                <th>Is Optional?</th>
                <th>Verified UserId</th>
              </tr>
            </thead>
            <tbody>
              {AUTHS.map((auth, index) => (
                <tr key={index}>
                  <td>Requested Auth {index + 1}</td>
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
                  <td>Requested Claim {index + 1}</td>
                  <td>
                    <a href={"https://factory.sismo.io/groups-explorer?search=" + claim.groupId}>
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
