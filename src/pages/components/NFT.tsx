import { useState } from "react";

export default function NFT(props: any) {

    const { img, myclick } = props;
    const [select, setSelect] = useState(false);
    // console.log(`myclick::`, myclick);

    return (
        <div className='col rg-2'>
            <img src={img} className="nft-img" alt="DEGEN" />
            <button className='s-btn' onClick={() => { setSelect(true); myclick(); }}>{select ? 'Selected' : 'Select'}</button>
        </div>
    );
}