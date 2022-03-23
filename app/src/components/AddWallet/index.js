import React, { useEffect, useState } from 'react';
import * as anchor from '@project-serum/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import idl from '../../idls/faucet.json';
import { ADD_WALLET_Constants } from '../../constants';

const { PublicKey, Connection, SystemProgram, SYSVAR_RENT_PUBKEY } = anchor.web3;

const { NETWORK} = COMMON_Contants;
const { whiteListKey, configAccountKey } = ADD_WALLET_Constants;

export const AddWallet = () => {
    const wallet = useWallet();
    const { publicKey } = wallet;

    const [accountKey, setAccountKey] = useState('');

    // GET provider
    const getProvider = async () => {
        const network = NETWORK;
    
        const anchorWallet = {
            publicKey: wallet.publicKey,
            signAllTransactions: wallet.signAllTransactions,
            signTransaction: wallet.signTransaction,
        }
        const connection = new Connection(network, "processed");
        const provider = new anchor.Provider(
            connection,
            anchorWallet,
            {
                preflightCommitment: "processed",
            }
        );
    
        return provider;
    }

    useEffect(() => {
        getInfo();
    },[publicKey])

    const getInfo = async() => {
        try {

            // address of deployed program
            const programId = new PublicKey(idl.metadata.address);    
            // Generate the program client from IDL.
            const program = new anchor.Program(idl, programId);    

            const whiteListData = await program.account.whiteList.fetch(whiteListKey);
            const configData = await program.account.config.fetch(configAccountKey);
            const counter = configData.counter.toNumber();
            for (let i = 0; i < counter; i++) {
                console.log("Account List: ", whiteListData.addresses[i].toBase58())
            }
        } catch (err) {
            console.log(err);
        }
    }
    
    // Enter depositing
    const add_wallet = async () => {
        const authority = wallet.publicKey;    

        const provider = await getProvider();
        anchor.setProvider(provider);
        // address of deployed program
        const programId = new PublicKey(idl.metadata.address);    
        // Generate the program client from IDL.
        const program = new anchor.Program(idl, programId);                

        const newWallet = new PublicKey(accountKey);
        const addys = [];
        addys.push(newWallet);
        try {
            await program.rpc.addWhitelistAddresses(addys, {
                accounts: {
                    authority,
                    config,
                    stateAccount
                }
            })

            await getInfo();
        } catch (err) {
            console.log(err);
        }

        console.log("End transaction")
    }
    
    return (
        <div>  
            <h2>6) Register Account</h2>
            <div>
                <input type="text" value={accountKey} onChange={(e) => setAccountKey(e.target.value)} />
            </div>
            <div>
                <button onClick={ () => add_wallet() }>
                    Register Account
                </button>
            </div>
        </div>
    );
}