import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from 'react-router-dom'
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import * as anchor from "@project-serum/anchor";

import Asset from './assets';
import '../scss/Main.scss';
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

/**
 *  CONSTANTS...
 */

export default function Welcome() {

    const navigation = useNavigate();
    const wallet = useWallet();
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
    const [balance, setBalance] = useState(0.0);


    useEffect(() => {
        (async () => {
            if (anchorWallet) {
                const balance = await connection.getBalance(anchorWallet.publicKey);
                setBalance(balance / LAMPORTS_PER_SOL);
                navigation('/main');
            }
        })()

    }, [anchorWallet])

    return (
        <>
            <div className="row j-end p-2 a-center">
                <div className="row cg-2 a-center">
                    <img src={Asset.solana}></img>
                    <span>{balance}SOL</span>
                </div>
                <WalletMultiButton />
            </div>
            <div className="main">
                <div className="container">
                    <div className="col f-center rg-6">
                        <img src={Asset.logo}></img>
                        <span className="f-40">DIGISNIPER</span>
                        <div className="col f-center rg-4">
                            <button className="btn">Select Wallet</button>
                            <button className="btn" onClick={() => { navigation('/main') }}>Enter DigiSniper</button>
                        </div>
                        <span className="f-28">Must hold a DigiKong NFT to enter</span>
                        <div className="row f-center cg-2">
                            <img src={Asset.ME_logo}></img>
                            <span>Buy on Magic Eden</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}