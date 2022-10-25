import { SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import * as anchor from "@project-serum/anchor";
import holderToken from './TokenAddress.json'
import {
  Commitment,
  Connection,
  PublicKey,
  Transaction,
  LAMPORTS_PER_SOL
} from "@solana/web3.js";
import {
  getParsedNftAccountsByOwner
} from "@nfteyez/sol-rayz";

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Snackbar, Chip, Container, Checkbox, Input } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { AlertState } from './utils';
import { CenterFocusStrongOutlined } from "@material-ui/icons";
import logo from './img/logo.jpg';
import { sendTransactions } from "./connection";

const splToken = require("@solana/spl-token");
const web3 = require("@solana/web3.js");

const WalletContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap; 
  justify-content: right;
`;

const WalletAmount = styled.div`
  color: black;
  width: auto;
  padding: 5px 5px 5px 16px;
  min-width: 48px;
  min-height: auto;
  border-radius: 22px;
  background-color: var(--main-text-color);
  box-shadow: 0px 3px 5px -1px rgb(0 0 0 / 20%), 0px 6px 10px 0px rgb(0 0 0 / 14%), 0px 1px 18px 0px rgb(0 0 0 / 12%);
  box-sizing: border-box;
  transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  font-weight: 500;
  line-height: 1.75;
  text-transform: uppercase;
  border: 0;
  margin: 0;
  display: inline-flex;
  outline: 0;
  position: relative;
  align-items: center;
  user-select: none;
  vertical-align: middle;
  justify-content: flex-start;
  gap: 10px;
`;

const Wallet = styled.ul`
  flex: 0 0 auto;
  margin: 0;
  padding: 0;
`;

const ConnectButton = styled(WalletMultiButton)`
  border-radius: 18px !important;
  padding: 6px 16px;
  background-color: #4E44CE !important;
  margin: 0 auto;
`;

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 20px;
  margin-right: 4%;
  margin-left: 4%;
  text-align: center;
  justify-content: center;
`;

const MintContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex: 1 1 auto;
  flex-wrap: wrap;
  gap: 20px;
`;

const Price = styled(Checkbox)`
  position: absolute !important;
  margin: 2px;
`;

const Image = styled.img`
  height: 200px;
  width: auto;
  border-radius: 7px;
  box-shadow: 5px 5px 40px 5px rgba(0, 0, 0, 0.5);
`;

const ImageShow = styled.img`
  height: auto;
  width: 95%;
  border-radius: 7px;
  box-shadow: 5px 5px 40px 5px rgba(0, 0, 0, 0.5);
`;

const rpcHost = process.env.REACT_APP_SOLANA_RPC_HOST!;
console.log(`rpcHost--`, rpcHost);

const connection = new anchor.web3.Connection(
  `https://api.mainnet-beta.solana.com`
);

console.log(`connection--`, connection);

export interface HomeProps {
  candyMachineId?: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  txTimeout: number;
  rpcHost: string;
  network: WalletAdapterNetwork;
}

const Home = (props: HomeProps) => {
  const [balance, setBalance] = useState<number>();
  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    severity: undefined,
  });
  const [nftList, setNftList] = useState<any[]>();
  const [nftListTmp, setNftTmpList] = useState<any[]>();
  const [transferNftList, setTransferNftList] = useState<String[]>([]);
  const [receiverAddr, setReceiverAddr] = useState<String>('');
  const [traitOption, setTraitOption] = useState<any>();
  const [collection, setCollection] = useState();
  const [trait, setTrait] = useState<any>();

  const [collectionList, setCollectionList] = useState<any[]>([]);
  const [traitList, setTraitList] = useState<any[]>()

  const [traitFilter, setTraitFilter] = useState<any>([]);

  const wallet = useWallet();

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
  }, [wallet]);


  useEffect(() => {
  }, [anchorWallet, props.connection]);

  return (
    <main>
    </main>
  );
};

export default Home;
