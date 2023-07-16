"use client";

import { useState } from "react";
import Header from "./components/Header";
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
  const [sismoConnectResponse, setSismoConnectResponse] = useState<SismoConnectResponse>();
  const [pageState, setPageState] = useState<string>("init");
  /* ***********************  Application states *************************** */
  return (
    <>
      <main className="main">
        <Header />
        {pageState == "init" ? (
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
                setSismoConnectResponse(response);
                setPageState("verifying");
                const verifiedResult = await fetch("/api/verify", {
                  method: "POST",
                  body: JSON.stringify(response),
                });
                setSismoConnectVerifiedResult(await verifiedResult.json());
                setPageState("verified");
              }}
            />
            <p className="callout">
              {" "}
              Notes: <br />
              1. First ZK Proof generation takes longer time, especially with bad internat as there
              is a zkey file to download once in the data vault connection <br />
              2. The more proofs you request, the longer it takes to generate them (about 2 secs per
              proof)
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
            <div className="status-wrapper">
              {pageState == "verifying" ? (
                <span className="verifying"> Verifying ZK Proofs... </span>
              ) : (
                <span className="verified"> ZK Proofs verified!</span>
              )}
            </div>
          </>
        )}

        {/* Table of the Sismo Connect requests and verified result */}

        {/* Table for Verified Auths */}
        {sismoConnectVerifiedResult && (
          <>
            <h3>Verified Auths</h3>
            <table>
              <thead>
                <tr>
                  <th>AuthType</th>
                  <th>Verified UserId</th>
                </tr>
              </thead>
              <tbody>
                {sismoConnectVerifiedResult.auths.map((auth, index) => (
                  <tr key={index}>
                    <td>{AuthType[auth.authType]}</td>
                    <td>{auth.userId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <br />

        {/* Table for Verified Claims */}
        {sismoConnectVerifiedResult && (
          <>
            <h3>Verified Claims</h3>
            <table>
              <thead>
                <tr>
                  <th>groupId</th>
                  <th>ClaimType</th>
                  <th>Verified Value</th>
                </tr>
              </thead>
              <tbody>
                {sismoConnectVerifiedResult.claims.map((claim, index) => (
                  <tr key={index}>
                    <td>
                      <a
                        target="_blank"
                        href={"https://factory.sismo.io/groups-explorer?search=" + claim.groupId}
                      >
                        {claim.groupId}
                      </a>
                    </td>
                    <td>{ClaimType[claim.claimType!]}</td>
                    <td>{claim.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Table of the Auths requests*/}
        <h3>Auths requested</h3>
        <table>
          <thead>
            <tr>
              <th>AuthType</th>
              <th>Requested UserId</th>
              <th>Optional?</th>
              <th>ZK proof</th>
            </tr>
          </thead>
          <tbody>
            {AUTHS.map((auth, index) => (
              <tr key={index}>
                <td>{AuthType[auth.authType]}</td>
                <td>{readibleHex(auth.userId || "No userId requested")}</td>
                <td>{auth.isOptional ? "optional" : "required"}</td>
                {sismoConnectResponse ? (
                  <td>{readibleHex(getProofDataForAuth(sismoConnectResponse, auth.authType)!)}</td>
                ) : (
                  <td> ZK proof not generated yet </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <br />

        {/* Table of the Claims requests  and their results */}
        <h3>Claims requested</h3>
        <table>
          <thead>
            <tr>
              <th>GroupId</th>
              <th>ClaimType</th>
              <th>Requested Value</th>
              <th>Can User Select Value?</th>
              <th>Optional?</th>
              <th>ZK proof</th>
            </tr>
          </thead>
          <tbody>
            {CLAIMS.map((claim, index) => (
              <tr key={index}>
                <td>
                  <a
                    target="_blank"
                    href={"https://factory.sismo.io/groups-explorer?search=" + claim.groupId}
                  >
                    {claim.groupId}
                  </a>
                </td>
                <td>{ClaimType[claim.claimType || 0]}</td>
                <td>{claim.value ? claim.value : "1"}</td>
                <td>{claim.isSelectableByUser ? "yes" : "no"}</td>
                <td>{claim.isOptional ? "optional" : "required"}</td>
                {sismoConnectResponse ? (
                  <td>
                    {readibleHex(
                      getProofDataForClaim(
                        sismoConnectResponse,
                        claim.claimType || 0,
                        claim.groupId!,
                        claim.value || 1
                      )!
                    )}
                  </td>
                ) : (
                  <td> ZK proof not generated yet </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Table of the Signature request and its result */}
        <h3>Signature requested and verified</h3>
        <table>
          <thead>
            <tr>
              <th>Message Requested</th>
              <th>Can User Modify message?</th>
              <th>Verified Signed Message</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{SIGNATURE_REQUEST.message}</td>
              <td>{SIGNATURE_REQUEST.isSelectableByUser ? "yes" : "no"}</td>
              <td>
                {sismoConnectVerifiedResult
                  ? sismoConnectVerifiedResult.signedMessage
                  : "ZK proof not verified yet"}
              </td>
            </tr>
          </tbody>
        </table>
      </main>
    </>
  );
}

function readibleHex(userId: string, startLength = 6, endLength = 4, separator = "...") {
  if (!userId.startsWith("0x")) {
    return userId; // Return the original string if it doesn't start with "0x"
  }
  return userId.substring(0, startLength) + separator + userId.substring(userId.length - endLength);
}

function getProofDataForAuth(
  sismoConnectResponse: SismoConnectResponse,
  authType: AuthType
): string | null {
  for (const proof of sismoConnectResponse.proofs) {
    if (proof.auths) {
      for (const auth of proof.auths) {
        if (auth.authType === authType) {
          return proof.proofData;
        }
      }
    }
  }

  return null; // returns null if no matching authType is found
}

function getProofDataForClaim(
  sismoConnectResponse: SismoConnectResponse,
  claimType: number,
  groupId: string,
  value: number
): string | null {
  for (const proof of sismoConnectResponse.proofs) {
    if (proof.claims) {
      for (const claim of proof.claims) {
        if (claim.claimType === claimType && claim.groupId === groupId && claim.value === value) {
          return proof.proofData;
        }
      }
    }
  }

  return null; // returns null if no matching claimType, groupId and value are found
}
