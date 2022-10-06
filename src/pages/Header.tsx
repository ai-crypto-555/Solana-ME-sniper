import React from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import Assets from "./assets";
import '../scss/Header.scss';

export default function Header() {
    return (
        <div className="header">
            <div className="row cg-1">
                <img src={Assets.logo_white}></img>
                <span>degen RE-ROLL</span>
            </div>
            <div className="row cg-1">
                <WalletMultiButton />
            </div>
        </div>
    );
}