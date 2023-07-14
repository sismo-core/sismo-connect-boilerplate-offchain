// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextResponse } from "next/server";
import { User } from "@/types";
import {
  appId,
  auths,
  claims,
  gitcoinGroupId,
  signature,
  sismoContributorGroupId,
  sismoLensFollowerGroupId,
  vaultConfig,
} from "../../../../sismo-connect-config";
import {
  SismoConnect,
  AuthType,
  SismoConnectVerifiedResult,
  SismoConnectConfig,
} from "@sismo-core/sismo-connect-server";

const config: SismoConnectConfig = {
  appId: appId,
  vault: vaultConfig,
};

const sismoConnect = SismoConnect({ config });

export async function POST(req: Request) {
  const { response } = await req.json();

  try {
    // verify the validity of the response sent by the frontend
    // and retrieve data shared by your user from their Vault
    const result: SismoConnectVerifiedResult = await sismoConnect.verify(
      response,
      {
        auths: auths,
        claims: claims,
        signature: signature,
      }
    );

    // the userId is an app-specific, anonymous identifier of a vault
    // userId = hash(userVaultSecret, appId).
    const userId = result.getUserId(AuthType.VAULT);

    const [twitterId] = result.getUserIds(AuthType.TWITTER);
    const [telegramId] = result.getUserIds(AuthType.TELEGRAM);
    const [githubId] = result.getUserIds(AuthType.GITHUB);
    const [address] = result.getUserIds(AuthType.EVM_ACCOUNT);

    const [gitcoinClaim] = result.getClaims(gitcoinGroupId);
    const gitcoinScore = gitcoinClaim.value;
    const [sismoContributorClaim] = result.getClaims(sismoContributorGroupId);
    const sismoContributorLevel = sismoContributorClaim.value;
    const [sismoLensFollowerClaim] = result.getClaims(sismoLensFollowerGroupId);
    const isSismoLensFollower = sismoLensFollowerClaim.value;

    const user = {
      id: userId,
      isSismoLensFollower,
      gitcoinScore,
      sismoContributorLevel,
      twitterId,
      telegramId,
      githubId,
      address,
    } as User;

    // save the user in your database and connect it

    return NextResponse.json(user);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(e.message, { status: 500 });
  }
}
