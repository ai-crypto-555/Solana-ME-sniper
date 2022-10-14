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
        // `https://ssc-dao.genesysgo.net/`
        `https://orbital-practical-frost.solana-mainnet.quiknode.pro/a3c2065e0790fdbae02212bc35ab37ca7b07ce7f/`
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
    //     await axios.get(`https://api-mainnet.magiceden.io/v2/instructions/buy`, {
    //         params: {
    //             buyer: '9pvzDd9dEM62XP3MzYADYmv1LPQmdCFZKMXAx1Z6p43Z',
    //             auctionHouseAddress: 'E8cU1WiRWjanGxmn96ewBgk9vPTcL6AEZ1t6F6fkgUWe',
    //             tokenMint: 'EMXdjWniwGipV6GifE3sgLa4GSUFt5uHr3rFCdFNPMDb',
    //             price: 0.96,
    //         },
    //         headers: { Authorization: "Bearer " + apiKey }
    //     }).then(async (res) => {
    //         try {
    //             const txSigned = res.data.txSigned;
    //             const txn = Transaction.from(
    //                 Buffer.from(txSigned.data)
    //             );
    //             console.log(`txn:::`, txn);
    //             const signature = await wallet.sendTransaction(
    //                 txn,
    //                 connection,
    //             )
    //         } catch (err) {
    //             console.log(`user rejected::`, err);
    //         }
    //     })
    // }

    const getTrackData1 = async () => {

        let transactions = await connection.getConfirmedSignaturesForAddress2(magicEdenPubKey);

        let signatureList: any[] = [];

        // last 15 transactions are enough for us..
        for (let i = 0; i < 12; i++) {
            signatureList.push(transactions[i].signature);
        }

        //parse transaction data...
        let signList = await connection.getParsedConfirmedTransactions(signatureList);

        let listedTokenList: any[] = [];
        let collectionList: any[] = [];

        signList.forEach((item: any, idx) => {
            if (item != null) {
                let actionType = item.meta.logMessages[1].split(":")[2];
                if (actionType != undefined) {
                    //fetch only list transactions...
                    if (actionType.includes(' Sell')) {
                        let tokenMint = item.meta.postTokenBalances[0].mint;
                        listedTokenList.push(tokenMint);
                    }
                }

            }
        })

        let tokenInfoList: any[] = [];
        let tokenListInfoList: any[] = [];
        let collectionInfoList: any[] = [];

        tokenInfoList = await Promise.all(
            listedTokenList.map((tokenMint) =>
                axios.get(
                    `https://api-mainnet.magiceden.dev/v2/tokens/${tokenMint}`, {
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': "GET,POST,OPTIONS,DELETE,PUT"
                    }
                })
            )
        );

        tokenListInfoList = await Promise.all(
            listedTokenList.map((tokenMint) =>
                axios.get(
                    `https://api-mainnet.magiceden.dev/v2/tokens/${tokenMint}/listings`, {
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': "GET,POST,OPTIONS,DELETE,PUT"
                    }
                })
            )
        );

        tokenInfoList.forEach((tokenInfo: any) => {
            collectionList.push(tokenInfo.data.collection)
        });

        collectionInfoList = await Promise.all(
            collectionList.map((collection) =>
                axios.get(`https://api-mainnet.magiceden.dev/v2/collections/${collection}/stats`, {
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': "GET,POST,OPTIONS,DELETE,PUT"
                    }
                })
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

    const getTrackData = async () => {

        let transactions = await connection.getConfirmedSignaturesForAddress2(magicEdenPubKey);

        let signatureList: any[] = [];

        // last 15 transactions are enough for us..
        for (let i = 0; i < 12; i++) {
            signatureList.push(transactions[i].signature);
        }

        //parse transaction data...
        let signList = await connection.getParsedConfirmedTransactions(signatureList);

        let listedTokenList: any[] = [];
        let collectionList: any[] = [];

        signList.forEach((item: any, idx) => {
            if (item != null) {
                let actionType = item.meta.logMessages[1].split(":")[2];
                if (actionType != undefined && item.meta.postTokenBalances != undefined && item.meta.postTokenBalances[0] != undefined) {
                    //fetch only list transactions...
                    if (actionType.includes(' Sell')) {
                        let tokenMint = item.meta.postTokenBalances[0].mint;
                        listedTokenList.push(tokenMint);
                    }
                }

            }
        })

        let tokenInfoList: any[] = [];
        let tokenListInfoList: any[] = [];
        let collectionInfoList: any[] = [];

        // tokenInfoList = await Promise.all(
        //     listedTokenList.map((tokenMint) =>
        //         axios.get(
        //             `https://api-mainnet.magiceden.dev/v2/tokens/${tokenMint}`, {
        //             headers: { Authorization: "Bearer " + apiKey }
        //         })
        //     )
        // );

        // tokenListInfoList = await Promise.all(
        //     listedTokenList.map((tokenMint) =>
        //         axios.get(
        //             `https://api-mainnet.magiceden.dev/v2/tokens/${tokenMint}/listings`, {
        //             headers: { Authorization: "Bearer " + apiKey }
        //         })
        //     )
        // );

        // tokenInfoList.forEach((tokenInfo: any) => {
        //     collectionList.push(tokenInfo.data.collection)
        // });

        // collectionInfoList = await Promise.all(
        //     collectionList.map((collection) =>
        //         axios.get(`https://api-mainnet.magiceden.dev/v2/collections/${collection}/stats`, {
        //             headers: { Authorization: "Bearer " + apiKey }
        //         })
        //     )
        // );

        // let trackInfoList: any[] = [];

        // for (let i = 0; i < tokenInfoList.length; i++) {
        //     if (tokenInfoList[i].data != null && tokenListInfoList[i].data.length > 0) {
        //         trackInfoList.push({
        //             tokenMint: tokenInfoList[i].data.mintAddress,
        //             tokenAccount: tokenListInfoList[i].data[0].tokenAddress,
        //             name: tokenInfoList[i].data.name,
        //             image: tokenInfoList[i].data.image,
        //             collection: tokenInfoList[i].data.collection,
        //             auctionHouse: tokenListInfoList[i].data[0].auctionHouse,
        //             pdaAddress: tokenListInfoList[i].data[0].pdaAddress,
        //             expiry: tokenListInfoList[i].data[0].expiry,
        //             price: tokenListInfoList[i].data[0].price,
        //             seller: tokenListInfoList[i].data[0].seller,
        //             sellerReferral: tokenListInfoList[i].data[0].sellerReferral,
        //             floorPrice: collectionInfoList[i].data.floorPrice,
        //             listedCount: collectionInfoList[i].data.listedCount,
        //         })
        //     }
        // }

        let result = await axios.post('http://localhost:3005/', {
            list: listedTokenList
        });

        let trackInfoList = result.data.result;

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

        console.log(`trackinfo::`, trackInfoList);
        console.log(`cur tracks total::`, trackData);
    }

    useEffect(() => {

        (async () => {
            if (anchorWallet) {

                let balanace = await connection.getBalance(wallet.publicKey!);
                console.log(`balance::`, balanace);

                // await buyTest();

                await getTrackData();
            }
        })()

    }, [anchorWallet])

    return (
        <>
            <div className="track">
                <div className="row between p-2">
                    <div className="row cg-2">
                        <img src={Asset.logo} style={{ width: '70px' }}></img>
                        <span className="f-18">DIGISNIPER</span>
                    </div>
                    <div className="row j-end">
                        <div className="row cg-2">
                            <img src={Asset.solana}></img>
                            <span>{balance}SOL</span>
                        </div>
                        <WalletMultiButton />
                    </div>
                </div>
                <div className="container">
                    <div className="row">
                        <div className="j-start flex1">
                            <span className="f-16">Filters</span>
                        </div>
                        <div className="row j-center flex1">
                            <button className="track-btn">
                                <span>{isPlay ? 'Tracking Live' : 'Tracking Pause'}</span>
                                <span className="on"></span>
                            </button>
                        </div>
                        <div className="flex1 t-right">
                            <img src={Asset.pause} alt="IMG" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}