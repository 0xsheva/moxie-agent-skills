import type { MoxieTypes } from "@moxie-protocol/moxie-lib";

export const MOXIE_BACKEND_GRAPHQL_ENDPOINT: string =
    process.env["MOXIE_BACKEND_GRAPHQL_ENDPOINT"] || "";
export const CREATOR_AGENT_TOKEN_ADDRESS: string =
    process.env["CREATOR_AGENT_TOKEN_ADDRESS"] || "";
export const MINIMUM_CREATOR_AGENT_COINS: number =
    Number(process.env["MINIMUM_CREATOR_AGENT_COINS"]) || 0;
export const COMMON_AGENT_ID: string = process.env["COMMON_AGENT_ID"] || "";
export const BASE_RPC_URL: string = process.env["BASE_RPC_URL"] || "";
// queries

export const ME_QUERY = `
    query Me {
        Me {
            id
            userName
            name
            bio
            profileImageUrl
            referralCode
            referrerId
            moxieScore
            moxieRank
            totalUsers
            primaryWalletId
            communicationPreference
            createdAt
            identities {
                id
                userId
                type
                dataSource
                connectedIdentitiesFetchStatus
                metadata
                profileId
                isActive
                createdAt
                updatedAt
            }
            wallets {
                id
                userId
                walletAddress
                walletType
                dataSource
                createdAt
                deletedAt
            }
        }
    }
`;

/**
 * REUSABLE MOCK DATA STARTS BELOW
 */
export const mockMoxieUser: MoxieTypes.MoxieUser = {
    id: "M0",
    userName: "vitalik.eth",
    name: "vitalik.eth",
    bio: null,
    profileImageUrl: "https://i.imgur.com/Y1au7ZB.jpg",
    referralCode: "TTg=",
    referrerId: "M12",
    communicationPreference: "WARPCAST",
    primaryWalletId: "03463334-3c5c-4d08-9551-188f62b2586a",
    moxieScore: 1000,
    moxieRank: 0,
    createdAt: "2024-12-20T14:37:34.348Z",
    moxieScoreResyncInfo: {
        status: "COMPLETED",
    },
    identities: [
        {
            id: "19b49f2a-8f57-4ebe-9897-a6dda30fb543",
            userId: "M0",
            type: "ENS",
            connectedIdentitiesFetchStatus: "SUCCESS",
            metadata: {
                ens: "vitalik.eth",
                expiryTimestamp: "2025-09-07T21:41:38.000Z",
                resolvedAddress: "0xcbfbcbfca74955b8ab75dec41f7b9ef36f329879",
            },
            profileId: "vitalik.eth",
            isActive: true,
            createdAt: "2025-01-07T12:12:22.361Z",
            updatedAt: "2025-01-07T12:12:22.361Z",
            dataSource: "AIRSTACK",
        },
        {
            id: "fd14e2a4-11a2-4115-81b4-4b1d266ade64",
            userId: "M8",
            type: "FARCASTER",
            connectedIdentitiesFetchStatus: "SUCCESS",
            metadata: {
                bio: "hullo",
                fid: 5650,
                pfp: "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/341d47e1-f746-4f5c-8fbe-d9e56fa66100/original",
                type: "farcaster",
                username: "vitalik.eth",
                verifiedAt: "2024-12-20T14:59:37.000Z",
                displayName: "Vitalik Buterin",
                ownerAddress: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
                firstVerifiedAt: "2024-12-20T14:59:37.000Z",
                latestVerifiedAt: "2024-12-20T14:59:37.000Z",
            },
            profileId: "5650",
            isActive: true,
            createdAt: "2025-01-07T12:12:05.833Z",
            updatedAt: "2025-01-07T12:12:05.833Z",
            dataSource: "PRIVY",
        },
        {
            id: "060e2d06-6fc4-45f8-8d51-3014a8406684",
            userId: "M0",
            type: "TWITTER",
            connectedIdentitiesFetchStatus: "SUCCESS",
            metadata: {
                name: "vitalik.eth",
                type: "twitter_oauth",
                subject: "2893777598",
                username: "VitalikButerin",
                verifiedAt: "2025-01-06T19:28:06.000Z",
                firstVerifiedAt: "2025-01-06T19:28:06.000Z",
                latestVerifiedAt: "2025-01-06T19:28:06.000Z",
                profilePictureUrl:
                    "https://pbs.twimg.com/profile_images/1880759276169224192/rXpjZO0A_400x400.jpg",
            },
            profileId: "VitalikButerin",
            isActive: true,
            createdAt: "2025-01-07T12:12:05.833Z",
            updatedAt: "2025-01-07T12:12:05.833Z",
            dataSource: "PRIVY",
        },
    ],
    wallets: [
        {
            id: "03463334-3c5c-4d08-9551-188f62b2586a",
            userId: "M0",
            walletAddress: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
            walletType: "injected",
            createdAt: "2025-01-07T12:12:05.852Z",
            deletedAt: null,
            dataSource: "PRIVY",
        },
        {
            id: "ef43dedc-9b17-49e0-93bf-94359d47f061",
            userId: "M0",
            walletAddress: "0xa5cc845ef113c4c0908d4c1f4616a000b9a67b80",
            walletType: "embedded",
            createdAt: "2025-01-07T12:12:05.852Z",
            deletedAt: null,
            dataSource: "PRIVY",
        },
    ],
};
