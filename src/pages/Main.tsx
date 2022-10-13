import React, { useEffect, useMemo, useState } from "react";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import axios from 'axios';

import '../scss/Main.scss';
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { getParsedNftAccountsByOwner } from "@nfteyez/sol-rayz";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

import Asset from './assets';

/**
 * 
 *  constants...
 */

const baseUrl = `https://api-mainnet.magiceden.dev/v2`;

const endpoint = process.env.REACT_APP_ENDPOINT!;
const magicEdenAddr = process.env.REACT_APP_ME_ADDRESS!;
const apiKey = process.env.REACT_APP_APIKEY!;

export default function Main() {

    const wallet = useWallet();
    const connection = new anchor.web3.Connection(
        `https://ssc-dao.genesysgo.net/`
    )
    const [balance, setBalance] = useState(0.0);
    const anchorWallet = useMemo(() => {
        if (
            !wallet ||
            !wallet.publicKey ||
            !wallet.signAllTransactions ||
            !wallet.signTransaction
        ) {
            return;
        }
        return {
            publicKey: wallet.publicKey,
            signAllTransactions: wallet.signAllTransactions,
            signTransaction: wallet.signTransaction,
        } as anchor.Wallet;
    }, [wallet])
    const magicEdenPubKey = new PublicKey(magicEdenAddr);
    const [trackData, setTrackData] = useState<any[]>([]);
    const [isPlay, setPlay] = useState<any>(true);

    // const buyTest = async () => {
    //     await axios.get()
    // }

    const getTrackData = async () => {

        let transactions = await connection.getConfirmedSignaturesForAddress2(magicEdenPubKey);

        let signatureList: any[] = [];

        // last 15 transactions are enough for us..
        for (let i = 0; i < 15; i++) {
            signatureList.push(transactions[i].signature);
        }

        //parse transaction data...
        let signList = await connection.getParsedConfirmedTransactions(signatureList);

        let listedTokenList: any[] = [];
        let collectionList: any[] = [];

        signList.forEach((item: any, idx) => {
            if (item != null) {
                let actionType = item.meta.logMessages[1].split(":")[2];

                //fetch only list transactions...
                if (actionType.includes(' Sell')) {
                    let tokenMint = item.meta.postTokenBalances[0].mint;
                    listedTokenList.push(tokenMint);
                }
            }
        })

        let tokenInfoList: any[] = [];
        let tokenListInfoList: any[] = [];
        let collectionInfoList: any[] = [];

        tokenInfoList = await Promise.all(
            listedTokenList.map((tokenMint) =>
                axios.get(
                    `https://api-mainnet.magiceden.dev/v2/tokens/${tokenMint}`
                )
            )
        );

        tokenListInfoList = await Promise.all(
            listedTokenList.map((tokenMint) =>
                axios.get(
                    `https://api-mainnet.magiceden.dev/v2/tokens/${tokenMint}/listings`
                )
            )
        );

        tokenInfoList.forEach((tokenInfo: any) => {
            collectionList.push(tokenInfo.data.collection)
        });

        collectionInfoList = await Promise.all(
            collectionList.map((collection) =>
                axios.get(`https://api-mainnet.magiceden.dev/v2/collections/${collection}/stats`)
            )
        );

        let trackInfoList: any[] = [];

        for (let i = 0; i < tokenInfoList.length; i++) {
            if (tokenInfoList[i].data != null && tokenListInfoList[i].data.length > 0) {
                trackInfoList.push({
                    tokenMint: tokenInfoList[i].data.mintAddress,
                    tokenAccount: tokenListInfoList[i].data[0].tokenAddress,
                    name: tokenInfoList[i].data.name,
                    image: tokenInfoList[i].data.image,
                    collection: tokenInfoList[i].data.collection,
                    auctionHouse: tokenListInfoList[i].data[0].auctionHouse,
                    pdaAddress: tokenListInfoList[i].data[0].pdaAddress,
                    expiry: tokenListInfoList[i].data[0].expiry,
                    price: tokenListInfoList[i].data[0].price,
                    seller: tokenListInfoList[i].data[0].seller,
                    sellerReferral: tokenListInfoList[i].data[0].sellerReferral,
                    floorPrice: collectionInfoList[i].data.floorPrice,
                    listedCount: collectionInfoList[i].data.listedCount,
                })
            }

        }

        console.log(`track:`, trackInfoList);

        if (trackData.length == 0) {
            setTrackData(trackInfoList);
        } else {
            setTrackData([
                ...trackData,
                ...trackInfoList
            ]);
        }
        if (isPlay) {
            setTimeout(async () => {
                await getTrackData();
            }, 1000)
        }
    }

    useEffect(() => {

        (async () => {
            if (anchorWallet) {

                let balanace = await connection.getBalance(wallet.publicKey!);
                console.log(`balance::`, balanace);

                await getTrackData();

                // setInterval(async () => {
                //     // get 1000 transactions...
                //     let transactions = await connection.getConfirmedSignaturesForAddress2(magicEdenPubKey);

                //     let signatureList: any[] = [];

                //     // last 15 transactions are enough for us..
                //     for (let i = 0; i < 15; i++) {
                //         signatureList.push(transactions[i].signature);
                //     }

                //     //parse transaction data...
                //     let signList = await connection.getParsedConfirmedTransactions(signatureList);

                //     let listedTokenList: any[] = [];
                //     let collectionList: any[] = [];

                //     signList.forEach((item: any, idx) => {
                //         console.log(`item:::`, item);
                //         let actionType = item.meta.logMessages[1].split(":")[2];

                //         //fetch only list transactions...
                //         if (actionType.includes(' Sell')) {
                //             let tokenMint = item.meta.postTokenBalances[0].mint;
                //             listedTokenList.push(tokenMint);
                //         }
                //     })

                //     let tokenInfoList: any[] = [];
                //     let tokenListInfoList: any[] = [];
                //     let collectionInfoList: any[] = [];

                //     tokenInfoList = await Promise.all(
                //         listedTokenList.map((tokenMint) =>
                //             axios.get(
                //                 `https://api-mainnet.magiceden.dev/v2/tokens/${tokenMint}`
                //             )
                //         )
                //     );

                //     tokenListInfoList = await Promise.all(
                //         listedTokenList.map((tokenMint) =>
                //             axios.get(
                //                 `https://api-mainnet.magiceden.dev/v2/tokens/${tokenMint}/listings`
                //             )
                //         )
                //     );

                //     tokenInfoList.forEach((tokenInfo: any) => {
                //         collectionList.push(tokenInfo.data.collection)
                //     });

                //     collectionInfoList = await Promise.all(
                //         collectionList.map((collection) =>
                //             axios.get(`https://api-mainnet.magiceden.dev/v2/collections/${collection}/stats`)
                //         )
                //     );

                //     let trackInfoList: any[] = [];

                //     for (let i = 0; i < tokenInfoList.length; i++) {
                //         if (tokenInfoList[i].data != null && tokenListInfoList[i].data.length > 0) {
                //             trackInfoList.push({
                //                 tokenMint: tokenInfoList[i].data.mintAddress,
                //                 tokenAccount: tokenListInfoList[i].data[0].tokenAddress,
                //                 name: tokenInfoList[i].data.name,
                //                 image: tokenInfoList[i].data.image,
                //                 collection: tokenInfoList[i].data.collection,
                //                 auctionHouse: tokenListInfoList[i].data[0].auctionHouse,
                //                 pdaAddress: tokenListInfoList[i].data[0].pdaAddress,
                //                 expiry: tokenListInfoList[i].data[0].expiry,
                //                 price: tokenListInfoList[i].data[0].price,
                //                 seller: tokenListInfoList[i].data[0].seller,
                //                 sellerReferral: tokenListInfoList[i].data[0].sellerReferral,
                //                 floorPrice: collectionInfoList[i].data.floorPrice,
                //                 listedCount: collectionInfoList[i].data.listedCount,
                //             })
                //         }

                //     }

                //     console.log(`${count}::`, trackInfoList);
                //     setTrackInfoList(trackInfoList);
                //     count++;
                // }, 5000);
            }
        })()

    }, [anchorWallet])

    return (
        <>
            <div className="row j-end p-2">
                <div className="row cg-2">
                    <img src={Asset.solana}></img>
                    <span>{balance}SOL</span>
                </div>
                <WalletMultiButton />
            </div>
        </>
    );
}