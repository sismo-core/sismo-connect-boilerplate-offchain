import {
  ClaimType,
  AuthType,
  SignatureRequest,
  AuthRequest,
  ClaimRequest,
  VaultConfig,
} from "@sismo-core/sismo-connect-client";

// you can create a new Sismo Connect app at https://factory.sismo.io
export const appId: `0x${string}` = "0xf4977993e52606cfd67b7a1cde717069";

// indicate to the Vault that you want to use the impersonation mode
// this should be used only in development
export const vaultConfig: VaultConfig = {
  impersonate: [
    "twitter:dhadrien_:2390703980",
    "github:dhadrien",
    "twitter:dhadrien_",
    "dhadrien.sismo.eth",
    "github:leosayous21",
    "leo21.sismo.eth",
  ],
};

export const gitcoinGroupId = "0x1cde61966decb8600dfd0749bd371f12";
export const sismoContributorGroupId = "0xe9ed316946d3d98dfcd829a53ec9822e";
export const sismoLensFollowerGroupId = "0xabf3ea8c23ff96893ac5caf4d2fa7c1f";

export const claims: ClaimRequest[] = [
  // we ask the user to prove that he has a gitcoin passport with a score above 15
  // https://factory.sismo.io/groups-explorer?search=0x1cde61966decb8600dfd0749bd371f12
  {
    groupId: gitcoinGroupId,
    claimType: ClaimType.GTE,
    value: 15,
    isSelectableByUser: true,
  },
  // we ask the user to prove that he is part of the Sismo Contributors group and selectively prove its level
  // https://factory.sismo.io/groups-explorer?search=0xe9ed316946d3d98dfcd829a53ec9822e
  {
    groupId: sismoContributorGroupId,
    isSelectableByUser: true,
  },
  // we optionally ask the user to prove that he is following Sismo on Lens
  // https://factory.sismo.io/groups-explorer?search=0xabf3ea8c23ff96893ac5caf4d2fa7c1f
  {
    groupId: sismoLensFollowerGroupId,
    isOptional: true,
  },
];

export const auths: AuthRequest[] = [
  { authType: AuthType.VAULT },
  { authType: AuthType.EVM_ACCOUNT, isOptional: true },
  { authType: AuthType.GITHUB, isOptional: true },
  { authType: AuthType.TELEGRAM, isOptional: true },
  { authType: AuthType.TWITTER, isOptional: true },
];

export const signature: SignatureRequest = {
  message: "This is a customizable signature message",
  isSelectableByUser: true,
};
