import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import axios from 'axios';

import '../scss/Main.scss';
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

import Asset from './assets';

/**
 * 
 *  constants...
 */

const baseUrl = `https://api-mainnet.magiceden.dev/v2`;
const baseServerUrl = `https://solanadomains.org`

const endpoint = process.env.REACT_APP_ENDPOINT!;
const magicEdenAddr = process.env.REACT_APP_ME_ADDRESS!;
const apiKey = process.env.REACT_APP_APIKEY!;


interface NFTInfo {
    tokenMint: String,
    tokenAccount: String,
    name: String,
    image: String,
    collection: String,
    auctionHouse: String,
    pdaAddress: String,
    expiry: String,
    price: Number,
    seller: String,
    sellerReferral: String,
    floorPrice: Number,
    listedCount: Number
}

export default function Main() {

    const wallet = useWallet();
    const connection = new anchor.web3.Connection(
        // `https://ssc-dao.genesysgo.net/`
        // `https://orbital-practical-frost.solana-mainnet.quiknode.pro/a3c2065e0790fdbae02212bc35ab37ca7b07ce7f/`
        'https://fragrant-billowing-haze.solana-mainnet.quiknode.pro/'
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
    const [filterData, setFilterData] = useState<any[]>([]);
    const [isPlay, setPlay] = useState<any>(true);

    const [filter, setFilter] = useState<string>('');
    const [autoNft, setAutoNft] = useState<any>(null);

    const [trackTime, setTrackTime] = useState(+new Date())

    const getTrackData = async () => {

        try {
            let transactions = await connection.getConfirmedSignaturesForAddress2(magicEdenPubKey);

            let signatureList: any[] = [];

            // last 15 transactions are enough for us..
            for (let i = 0; i < 20; i++) {
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

            let result = await axios.post(`${baseServerUrl}/track`, {
                list: listedTokenList
            });
            return result.data.result;
        } catch (err) {
            return [];
        }
    }

    React.useEffect(() => {
        let timer: NodeJS.Timeout
        if (isPlay) {
            timer = setTimeout(() => {

                getTrackData().then(result => {
                    console.log(new Date().toLocaleTimeString(), "transacdatae")
                    const d = {} as { [name: string]: any }
                    // const data = [] as any[];
                    for (const i of [...result, ...trackData]) {
                        d[i.name] = i;
                    }
                    setTrackData(Object.values(d))
                    setTrackTime(+new Date());
                });
                // } else {
                //     clearTimeout(timer);

            }, 2000);
        }
        return () => !!timer && clearTimeout(timer);
    }, [trackTime, isPlay])

    const buy = (nft: any) => {
        window.open(`https://magiceden.io/item-details/${nft.tokenMint}`, '_blank')
    }

    const changeCollect = (evt: any) => {

        let value = evt.target.value;
        setFilter(value);
        let filterList: any[] = [];
        trackData.forEach((item) => {
            if (item.collection != undefined && item.collection.includes(value) && value != '') {
                filterList.push(item);
            }
        })
        setFilterData(filterList);
    }

    useEffect(() => {
        (async () => {
            if (anchorWallet) {
                let balance = await connection.getBalance(anchorWallet.publicKey);
                setBalance(Number((balance / LAMPORTS_PER_SOL).toFixed(4)));

            }
        })()
    }, [anchorWallet])

    return (
        <>
            <div className="track">
                <div className="row between p-2 a-center">
                    <div className="row cg-1 a-center">
                        <img src={Asset.logo} style={{ width: '70px' }}></img>
                        <span className="f-18 logo-title">DIGISNIPER</span>
                    </div>
                    <div className="row j-end">
                        <div className="row cg-1 a-center">
                            <img src={Asset.solana} className="responsive1"></img>
                            <span>{balance}SOL</span>
                        </div>
                        <WalletMultiButton />
                    </div>
                </div>
                <div>
                    <div className="row border p-2 ml-2 mr-2 a-center">
                        <div className="j-start flex1 responsive1">
                            <span className="f-16">Filters</span>
                        </div>
                        <div className="row j-center flex5">
                            <button className="track-btn">
                                <span>{isPlay ? 'Tracking Live' : 'Tracking Pause'}</span>
                                {isPlay ? <span className="on"></span> : <span className="off"></span>}
                            </button>
                        </div>
                        <div className="flex1 t-right">
                            <img src={isPlay ? Asset.pause : Asset.play} style={{ width: '20px', height: '25px' }} alt="IMG" onClick={() => { setPlay(!isPlay); }} />
                        </div>
                    </div>


                    <div className="row mt-2 ml-2 mr-2">
                        <div className="responsive1 flex2 mt-1 a-center col">
                            <input className="search" value={filter} onChange={(evt) => { changeCollect(evt) }}></input>
                            <div className="filter">
                                {
                                    filterData.length > 0 &&
                                    filterData.map((item, key) => (
                                        <div className="col filter-item" key={key} onClick={() => { setAutoNft(item); setFilterData([]); setFilter(''); }}>
                                            <div className="row a-center p-1">
                                                <img src={item.image} />
                                                <div className="col ml-2">
                                                    <span className="f-14">{item.name}</span>
                                                    <span className="f-14">{item.collection}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>

                            {
                                autoNft &&
                                <div className="auto col rg-2 p-4 mt-5">
                                    <div className="row between a-center">
                                        <img src={autoNft.image}></img>
                                        <span className="f-16">{autoNft.name}</span>
                                    </div>
                                    <div className="row between a-center">
                                        <div className="row a-center">
                                            <img src={Asset.solana} />
                                            <span className="f-14">Max Price</span>
                                        </div>
                                        <input type="text" className="max" value={autoNft.price} />
                                    </div>
                                    <div className="row j-center">
                                        <button className="auto-buy">Auto Buy</button>
                                    </div>
                                </div>
                            }
                        </div>
                        <div className="responsive1 flex5 scroll content pr-2">
                            {
                                trackData.map((item: any, key) =>
                                    <div className="nft-item" key={key}>
                                        <div className="flex3 row cg-2">
                                            <img className="img" src={item.image}></img>
                                            <div className="col rg-1">
                                                <span className="f-18 ml-2">{item.name}</span>
                                                <span className="f-16">{item.collection}</span>
                                            </div>
                                        </div>

                                        <div className="flex3">
                                            <div className="row">
                                                <span className="grey f-16">{item.listedCount}</span>
                                                <span className="f-14">/4418</span>
                                            </div>
                                            <span className="f-14"></span>
                                        </div>
                                        <div className="flex2 row between">
                                            <div className="col">
                                                <div className="row">
                                                    <span>{item.price}</span>
                                                    <img src={Asset.solana} />
                                                </div>
                                                <button className="sm-btn">FP: {item.floorPrice / LAMPORTS_PER_SOL}</button>
                                            </div>
                                            <div className="col">
                                                <div className="row cg-1">
                                                    <button className="buy-btn" onClick={() => { buy(item) }}>
                                                        Direct Buy
                                                    </button>
                                                    <img src={Asset.ME_logo} alt="IMG" />
                                                </div>
                                                {/* <span className="grey f-10 ml-2">4 seconds ago</span> */}
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                        <div className="responsive1 flex1"></div>
                    </div>


                    <div className="col responsive">
                        <div className="track-content scroll">
                            {
                                trackData.map((item, key) => (
                                    <div className="card" key={key}>
                                        <div className="row between a-center">
                                            <img src={item.image} className="img" />
                                            <div className="col a-end">
                                                <span className="f-16">{item.name}</span>
                                                <span className="f-14">{item.collection}</span>
                                                <div className="row f-14">
                                                    <span className="grey">{item.listedCount}</span>
                                                    <span>/8888</span>
                                                    <span className="ml-1"></span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row between a-center">
                                            <div className="col">
                                                <div className="row a-center">
                                                    <span className="f-14">{item.price}</span>
                                                    <img src={Asset.solana} />
                                                </div>
                                                <span className="f-14">
                                                    FP: {item.floorPrice / LAMPORTS_PER_SOL}
                                                </span>
                                            </div>
                                            <img src={Asset.ME_logo} />
                                            <button className="buy" onClick={() => { buy(item) }}>
                                                Direct Buy
                                            </button>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                        <div className="row j-center mt-2">
                            <span className="f-24">Filter</span>
                        </div>

                        <div className="col a-center rg-2 mt-2">
                            <input className="search" value={filter} onChange={(evt) => { changeCollect(evt) }}></input>
                            <div className="filter">
                                {
                                    filterData.length > 0 &&
                                    filterData.map((item, key) => (
                                        <div className="col filter-item" key={key} onClick={() => { setAutoNft(item); setFilterData([]); setFilter(''); }}>
                                            <div className="row a-center p-1">
                                                <img src={item.image} />
                                                <div className="col ml-2">
                                                    <span className="f-14">{item.name}</span>
                                                    <span className="f-14">{item.collection}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>

                            {
                                autoNft &&
                                <div className="auto col rg-2 p-4 mt-5">
                                    <div className="row between a-center">
                                        <img src={autoNft.image}></img>
                                        <span className="f-16">{autoNft.name}</span>
                                    </div>
                                    <div className="row between a-center">
                                        <div className="row a-center">
                                            <img src={Asset.solana} />
                                            <span className="f-14">Max Price</span>
                                        </div>
                                        <input type="text" className="max" value={autoNft.price} />
                                    </div>
                                    <div className="row j-center">
                                        <button className="auto-buy">Auto Buy</button>
                                    </div>
                                </div>
                            }
                        </div>

                        <div className="row j-center mt-2 grey">
                            <span className="f-32">built by </span>
                            <span className="f-32 ml-1">Studio9</span>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}