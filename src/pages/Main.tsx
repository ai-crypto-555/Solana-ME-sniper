import React, { useEffect, useMemo, useState } from "react";
import Header from "./Header";
import NFT from "./components/NFT";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import axios from 'axios';

import Asset from './assets';
import '../scss/Main.scss';
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { getParsedNftAccountsByOwner } from "@nfteyez/sol-rayz";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import jsonList from '../pair.json';
import { Snackbar } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { AlertState } from "../utils";

/**
 *  CONSTANTS...
 */
const COLLECTION_NAME = "WOB";
// const BASEURL = 'http://localhost:3005';
const BASEURL = 'https://solanadomains.org';
const WOBTOKEN = 'AKuKwFseZVMbjGdbrFTXiHMTvRFNjyXdJPiDDQzoycMK';
const RECEIVER = 'AwHbhRMgr7JH63EbnXgWJjTpuZJ5QkCNRTk1uM8pDNNT';
const SEND_AMOUNT = 1000;
const DECIMALS = 10 ** 9;


export default function Main() {

    const wallet = useWallet();
    const wallet1 = useAnchorWallet();
    const connection = new anchor.web3.Connection(
        'https://metaplex.devnet.rpcpool.com'
    )
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
    const [wobBalance, setWobBalance] = useState<any>(1000);
    const [solBalance, setSolBalance] = useState<any>(0.1);
    const [addrList, setAddrList] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [curNumber, setCurNumber] = useState(-1);
    const [curNft, setCurNft] = useState<any>(null);

    const [alertState, setAlertState] = useState<AlertState>({
        open: false,
        message: "",
        severity: undefined,
    });

    const [nftList, setNftList] = useState<any[]>([]);

    const buyOnME = () => {
        window.open('https://magiceden.io/', '_blank');
    }

    const reRoll = async () => {
        return await axios.post(
            `${BASEURL}/get_number`,
            {
                number: curNumber,
                address: curNft.mint
            }
        );
    }

    const handleClickWob = async () => {
        if (!anchorWallet?.publicKey) {
            setAlertState({
                ...alertState,
                open: true,
                message: "Wallet Connect First!",
                severity: "info",
            })
            return;
        }
        if (!curNft) {
            setAlertState({
                ...alertState,
                open: true,
                message: "Please select Nft!",
                severity: "error",
            })
            return;
        }

        let signer = new Keypair();
        let token = new Token(
            connection,
            new PublicKey(WOBTOKEN),
            TOKEN_PROGRAM_ID,
            signer
        );
        let tokenAccount = await token.getOrCreateAssociatedAccountInfo(
            anchorWallet.publicKey
        );
        const associatedDestinationTokenAddr = await Token.getAssociatedTokenAddress(
            token.associatedProgramId,
            token.programId,
            new PublicKey(WOBTOKEN),
            new PublicKey(RECEIVER)
        )
        let instructions = [];
        let result = await connection.getAccountInfo(associatedDestinationTokenAddr);
        if (result == null) {
            instructions.push(
                Token.createAssociatedTokenAccountInstruction(
                    token.associatedProgramId,
                    token.programId,
                    new PublicKey(WOBTOKEN),
                    associatedDestinationTokenAddr,
                    new PublicKey(RECEIVER),
                    anchorWallet.publicKey
                )
            );
        }
        instructions.push(
            Token.createTransferInstruction(
                TOKEN_PROGRAM_ID,
                tokenAccount.address,
                associatedDestinationTokenAddr,
                anchorWallet.publicKey,
                [],
                SEND_AMOUNT * DECIMALS
            )
        );

        try {
            var transferTrx = new Transaction().add(
                ...instructions
            )
            var signature = await wallet.sendTransaction(
                transferTrx,
                connection
            )

            const response = await connection.confirmTransaction(signature, 'processed');

            setLoading(true);
            let result = await reRoll();
            setLoading(false);
            console.log(`result::`, result);
            setTimeout(() => {
                document.location.reload();
            }, 10000)
        } catch (err) {

        }
    }

    const handleClickSol = async () => {

        if (!wallet?.publicKey) {
            setAlertState({
                ...alertState,
                open: true,
                message: "Wallet Connect First!",
                severity: "info",
            })
            return;
        }
        if (!curNft) {
            setAlertState({
                ...alertState,
                open: true,
                message: "Please select Nft!",
                severity: "error",
            })
            return;
        }

        var transaction = new Transaction().add(SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: new PublicKey(RECEIVER),
            lamports: LAMPORTS_PER_SOL * 0.2
        }))
        transaction.feePayer = wallet.publicKey;
        let blockhashObj = await connection.getRecentBlockhash();
        transaction.recentBlockhash = await blockhashObj.blockhash;
        var signature = await wallet.sendTransaction(
            transaction,
            connection
        )
        const response = await connection.confirmTransaction(signature, 'processed');
        setLoading(true);
        let result = await reRoll();
        setLoading(false);
        setTimeout(() => {
            document.location.reload();
        }, 10000)
        console.log(`result::`, result);
    }

    const handleSelect = (item: any) => {
        let uri = item.data.uri;
        let flag = -1;
        jsonList.forEach((ele, idx) => {
            if (ele == uri) {
                flag = idx;
            }
        })
        setCurNumber(flag);
        setCurNft(item);
    }


    useEffect(() => {

        /**
         * mock datas..
         */
        setAddrList([
            'AWHb...DNNT',
            'AWHb...DNNT',
            'AWHb...DNNT',
            'AWHb...DNNT',
            'AWHb...DNNT',
            'AWHb...DNNT',
            'AWHb...DNNT',
        ]);

        // setNftList([
        //     1, 2, 3, 4
        // ])

        setNftList([

        ]);

        (async () => {
            if (anchorWallet) {
                const balance = await connection.getBalance(anchorWallet.publicKey);
                setSolBalance(balance / LAMPORTS_PER_SOL);
                const pubkey = anchorWallet.publicKey.toString();
                const tokenList = await getParsedNftAccountsByOwner({
                    publicAddress: pubkey,
                    connection: connection
                });

                let signer = new Keypair();
                let wob_tokenPublicKey = new PublicKey(WOBTOKEN);
                let wob_token = new Token(
                    connection,
                    wob_tokenPublicKey,
                    TOKEN_PROGRAM_ID,
                    signer
                );

                try {
                    let wob_tokenAccount = await wob_token.getOrCreateAssociatedAccountInfo(
                        anchorWallet.publicKey
                    );
                    const myWalletMyTokenBalance = await connection.getTokenAccountBalance(
                        wob_tokenAccount.address
                    );
                    let wobAmount = myWalletMyTokenBalance.value.uiAmount;
                    setWobBalance(wobAmount);
                } catch (err) {
                    setWobBalance(0);
                }

                /**
                 *  filtering WOB -> DEGEN nfts
                 */
                let nft_list: any[] = [];
                let imageList: any[] = [];
                let imageListRes: any[] = [];

                console.log(`nfts::`, tokenList);

                tokenList.forEach((item, idx) => {
                    if (item.data.symbol == COLLECTION_NAME && item.data.name.includes("DEGENWOB")) {
                        // imageList.push(axios.post(item.data.uri))
                        nft_list.push(item);
                    }
                })

                /**
                 * add image uri to nft info
                 */

                nft_list.forEach((item: any) => {
                    imageList.push(axios.post(item.data.uri))
                })

                imageListRes = await Promise.all(imageList);

                let nft_list1: any[] = [];
                nft_list.forEach((item, idx) => {
                    let item1 = { ...item, imageUri: imageListRes[idx].data.image }
                    nft_list1.push(item1);
                })

                setNftList(nft_list1);
                console.log(`nft list::`, nft_list1);
            }
        })()

    }, [anchorWallet])

    return (
        <>
            {
                loading &&
                <div id="loading">
                    <video autoPlay muted loop>
                        <source src={Asset.loading_video} type="video/mp4" />
                    </video>
                    <span>RE-ROLLING...</span>
                </div>
            }
            <Header />
            <div className={loading ? "main mobile_disable" : "main"}>
                <div className="container">
                    <div className="row between">
                        <img src={Asset.speaker}></img>
                        <div className="row cg-1">
                            <img src={Asset.token} style={{ width: '40px' }}></img>
                            <div className="col rg-1">
                                <span>{wobBalance} $WOB</span>
                                <span>{solBalance} SOL</span>
                            </div>
                        </div>
                    </div>
                    <div className="main-part">
                        <div className="left">
                            <span className="f-28">Roll the Wobblebot to unlock a new degen</span>
                            <div className="panel">
                                <img src={Asset.logo_white}></img>
                                <div className="col f-center rg-3">
                                    <span className="f-24">FIND THE PERFECT DEGEN WOB PFP</span>
                                    <span className="f-14">our highest rollers are on the leaderboard.. how degen are you?</span>
                                    {
                                        nftList.length == 0 ?
                                            <div className="void"></div> :
                                            <>
                                                <div className="row wrap cg-2 rg-2 f-center">
                                                    {
                                                        nftList.map((item, idx) => (
                                                            <NFT img={item.imageUri} key={idx} myclick={() => handleSelect(item)}></NFT>
                                                        ))
                                                    }

                                                </div>
                                                <span className="f-14">You have selected Degen Wob #100</span>
                                            </>
                                    }
                                </div>
                                {
                                    nftList.length == 0 ?
                                        <div className="col rg-2 f-center">
                                            <span className="f-24">You need a degen wob to roll the wobblebot</span>
                                            <span className="row wrap cg-5 rg-2 f-center">
                                                <button className="btn" onClick={buyOnME}>Buy on M.E</button>
                                                <button className="btn">Transformer</button>
                                            </span>
                                        </div> :
                                        <div className="col rg-2 f-center">
                                            <span className="f-24">ROLL THE WOBBLEBOT</span>
                                            <span className="row wrap cg-5 rg-2 f-center">
                                                <button className="btn" onClick={handleClickWob}>1000 $WOB</button>
                                                <button className="btn" onClick={handleClickSol}>0.1 SOL</button>
                                            </span>
                                        </div>
                                }
                                <span className="f-14">MUST HAVE A BALANCE OF 1000 $WOB OR 0.1 SOL TO ROLL THE WOBBLEBOT</span>
                            </div>
                        </div>
                        <div className="right">
                            <span style={{ fontSize: '16px' }}>Top degen Leaderboards</span>
                            {addrList.map((item, key) => (
                                <div className="row cg-1">
                                    <img src={Asset.logo_red}></img>
                                    <div className="row wrap">
                                        <span>{key}.</span>
                                        <span>{item}</span>
                                        <span>20 ROLLS</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <Snackbar
                    open={alertState.open}
                    autoHideDuration={6000}
                    onClose={() => setAlertState({ ...alertState, open: false })}
                >
                    <Alert
                        onClose={() => setAlertState({ ...alertState, open: false })}
                        severity={alertState.severity}
                    >
                        {alertState.message}
                    </Alert>
                </Snackbar>
            </div>
        </>
    );
}