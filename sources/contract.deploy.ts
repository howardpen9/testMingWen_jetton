import { beginCell, contractAddress, toNano, TonClient4, WalletContractV4, internal, fromNano } from "ton";
import { mnemonicToPrivateKey } from "ton-crypto";
import { buildOnchainMetadata } from "./utils/jetton-helpers";

import { SampleJetton } from "./output/SampleJetton_SampleJetton";
import { printSeparator } from "./utils/print";
import * as dotenv from "dotenv";
dotenv.config();

let op_code = "deploy";
let tick_name = "nano";
let max_supply = "2100000000000000000";
let limit = "10000000000";
const string_first = `data:application/json,{"p":"ton-20","op":"${op_code}","tick":"${tick_name}","max":"${max_supply}","lim":"${limit}"}`; // Change to the content URL you prepared

(async () => {
    //create client for testnet sandboxv4 API - alternative endpoint
    const client4 = new TonClient4({
        endpoint: "https://sandbox-v4.tonhubapi.com",
    });

    let mnemonics = (process.env.mnemonics_2 || "").toString(); // 🔴 Change to your own, by creating .env file!
    let keyPair = await mnemonicToPrivateKey(mnemonics.split(" "));
    let secretKey = keyPair.secretKey;
    let workchain = 0; //we are working in basechain.
    let deployer_wallet = WalletContractV4.create({ workchain, publicKey: keyPair.publicKey });
    let deployer_wallet_contract = client4.open(deployer_wallet);

    const jettonParams = {
        name: "Test Token EEEEEEEEEE",
        description: "This is description of Test Jetton Token in Tact-lang",
        symbol: "EEEEEN",
        image: "https://avatars.githubusercontent.com/u/104382459?s=200&v=4",
    };

    // Create content Cell
    let content = buildOnchainMetadata(jettonParams);
    let init = await SampleJetton.init(deployer_wallet_contract.address, content);
    let jettonMaster = contractAddress(workchain, init);
    let deployAmount = toNano("0.1");

    // send a message on new address contract to deploy it
    let seqno: number = await deployer_wallet_contract.getSeqno();
    console.log("🛠️Preparing new outgoing massage from deployment wallet. \n" + deployer_wallet_contract.address);
    console.log("Seqno = ", seqno + "\n");
    printSeparator();

    // Get deployment wallet balance
    let balance: bigint = await deployer_wallet_contract.getBalance();

    console.log("Current deployment wallet balance = ", fromNano(balance).toString(), "💎TON");
    printSeparator();

    await deployer_wallet_contract.sendTransfer({
        seqno,
        secretKey,
        messages: [
            internal({
                to: jettonMaster,
                value: deployAmount,
                init: {
                    code: init.code,
                    data: init.data,
                },
                body: string_first,
            }),
        ],
    });
    console.log("====== Deployment message sent to =======\n", jettonMaster);
})();
