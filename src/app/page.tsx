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
          <b> Sismo Connect Starter </b>
          <br />
          offchain, nextJS and react
        </h1>

        <>
          <p>Using Sismo Connect we request ZK Proofs and verify them:</p>
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
              <p>{verifyState}</p>
              <br></br>
              <br></br>
            </>
          )}
          <table>
            <thead>
              <tr>
                <th>Auth</th>
                <th>AuthType</th>
                <th>Requested UserId</th>
                <th>isSelectableByUser</th>
                <th>isOptional</th>
                {sismoConnectVerifiedResult && <th>Verified UserId</th>}
              </tr>
            </thead>
            <tbody>
              {AUTHS.map((auth, index) => (
                <tr key={auth.userId}>
                  <td>Requested Auth {index + 1}</td>
                  <td>{AuthType[auth.authType]}</td>
                  <td>{auth.userId}</td>
                  <td>{auth.isSelectableByUser ? "yes" : "no"}</td>
                  <td>{auth.isOptional ? "yes" : "no"}</td>
                  {sismoConnectVerifiedResult && (
                    <td>
                      {sismoConnectVerifiedResult.auths.filter(
                        (verifiedAuth) => verifiedAuth.authType == auth.authType
                      ).length > 0
                        ? sismoConnectVerifiedResult.auths
                            .filter((verifiedAuth) => verifiedAuth.authType == auth.authType)
                            .map((verifiedAuth) => verifiedAuth.userId)
                        : "Not Proved"}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <table>
            <thead>
              <tr>
                <th>Claim</th>
                <th>GroupId</th>
                <th>IsSelectableByUser</th>
                <th>IsOptional</th>
                <th>Requested Value</th>
                <th>ClaimType</th>
                {sismoConnectVerifiedResult && <th>Verified Value</th>}
              </tr>
            </thead>
            <tbody>
              {CLAIMS.map((claim, index) => (
                <tr key={claim.groupId}>
                  <td>Requested Claim {index + 1}</td>
                  <td>{claim.groupId}</td>
                  <td>{claim.isSelectableByUser ? "yes" : "no"}</td>
                  <td>{claim.isOptional ? "yes" : "no"}</td>
                  <td>{claim.value ? claim.value : "1"}</td>
                  <td>{ClaimType[claim.claimType || "1"]}</td>
                  {sismoConnectVerifiedResult && (
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
