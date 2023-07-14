// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {
  SismoConnect,
  AuthType,
  SismoConnectVerifiedResult,
  ClaimType,
  SismoConnectConfig,
} from "@sismo-core/sismo-connect-server";
import { NextResponse } from "next/server";
import { AUTHS, CLAIMS, CONFIG, SIGNATURE_REQUEST } from "../../sismo-connect-config.ts";

/************************************************ */
/********* A SIMPLE IN-MEMORY DATABASE ********** */
/************************************************ */
const sismoConnect = SismoConnect({ config: CONFIG });

/************************************************ */
/***************** THE API ROUTE **************** */
/************************************************ */

// this is the API route that is called by the SismoConnectButton
export async function POST(req: Request) {
  const sismoConnectResponse = await req.json();
  try {
    const result: SismoConnectVerifiedResult = await sismoConnect.verify(sismoConnectResponse, {
      auths: AUTHS,
      claims: CLAIMS,
      signature: SIGNATURE_REQUEST,
    });
    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(e.message, { status: 500 });
  }
}
