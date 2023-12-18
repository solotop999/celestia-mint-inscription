import { DirectSecp256k1HdWallet, OfflineDirectSigner } from "@cosmjs/proto-signing"
import { SigningStargateClient } from "@cosmjs/stargate"

// EDIT HERE
const MY_KEY = "xxxxxxxxxxxxx" //change "xxxxxxxxxxxxx" with your Mnemonic 
const TOTAL_TX = 3 //change to a number transsaction you want
///////////////

const MEMO = 'ZGF0YToseyJvcCI6Im1pbnQiLCJhbXQiOjEwMDAwLCJ0aWNrIjoiY2lhcyIsInAiOiJjaWEtMjAifQ=='
const FEE = '192'
const GAS = '95644'
const RPC = "https://rpc.lunaroasis.net/"

const prepareAccount = async (): Promise<OfflineDirectSigner> => {
    return DirectSecp256k1HdWallet.fromMnemonic((MY_KEY).toString(), {
        prefix: "celestia",
    })
}

const Start = async (): Promise<void> => {
    const my_Wallet: OfflineDirectSigner = await prepareAccount()
    const my_Pubkey = (await my_Wallet.getAccounts())[0].address
    
    const signingClient = await SigningStargateClient.connectWithSigner(RPC, my_Wallet)
    const balances = await signingClient.getAllBalances(my_Pubkey);
    const utiaBalance = balances.find((coin) => coin.denom === 'utia');
    const utiaAmount = utiaBalance ? parseFloat(utiaBalance.amount) : 0;
    const tiaAmount = utiaAmount / 1_000_000; 

    console.log(`My wallet Address: ${my_Pubkey}` )
    console.log(` - Chain: ${await signingClient.getChainId()}\n - Balance: ${tiaAmount}\n - Block Height: ${await signingClient.getHeight()}\n\n`)
    
   
    
    for(let count=0; count < TOTAL_TX; count++){
        const result = await signingClient.sendTokens(my_Pubkey, my_Pubkey, [{ denom: "utia", amount: "1" }], {
            amount: [{ denom: "utia", amount: FEE }],
            gas: GAS,
        },
        MEMO,
        )

        console.log(`${count+1}. Explorer: https://celestia.explorers.guru/transaction/${result.transactionHash}`)
    }
    
    console.log("\n=======> [ DONE ALL. CONGRATS ] <=======")
}

Start()
