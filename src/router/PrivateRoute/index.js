import React, { useEffect, useState } from "react"
import { Route } from "react-router-dom"
import Web3 from 'web3'

import styles from './PrivateRoute.module.scss'
import { useAppDispatch } from '../../redux/hook'
import { setMembership } from "../../redux/membershipSlice"
import { CHAIN_ID, CHAIN_ID_HEX } from "../../constant/env"

import Header from "../../components/Header"
import Footer from "../../components/Footer"
import {
    initWallet,
    accountAddress,
    chainId,
    closeWalletProvider,
    comunityContract2

} from "../../utils/web3/Wallet"

const PrivateRoute = ({ component: Component, ...restOfProps }) => {

    const dispatch = useAppDispatch()
    const [account, setAccount] = useState("")
    const [isOpenMenu, setIsOpenMenu] = useState(false)

    const changeNet = async () => {
        const web3 = new Web3(Web3.givenProvider)
        try {
            await web3.currentProvider.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: CHAIN_ID_HEX }]
            })
        } catch (error) {
            console.log('error', error.message)
        }
    }

    const init = async () => {
        await initWallet()
        changeNet()
        setAccount(accountAddress)
    }

    const handleSetAccount = () => {
        init()
        setIsOpenMenu(false)
    }

    const closeAccount = () => {
        closeWalletProvider()
        setAccount("")
        setIsOpenMenu(false)
    }

    useEffect(() => {
        if (chainId === CHAIN_ID) {
            try {
                // this was hardcoded to tokenid 0, should be the tokenid for this token - todo: put this in config "utils/web3/wallet"
                console.log("Chain ID: ", CHAIN_ID);
                comunityContract2?.methods.canMint(accountAddress).call().then(res => {
                    let hasMembership = (res > 0) ? true : false
                    dispatch(setMembership(hasMembership))
                })
                /*
                console.log(ETHERSCAN_URL);
                console.log(membershipContract._address);
                if (membershipContract._address)
                membershipContract?.methods.balanceOf(accountAddress, "111515117730074772965449733806193829182550002799402836500696112828456993030244").call().then(res => {
                    let hasMembership = (res > 0) ? true : false
                    dispatch(setMembership(hasMembership))
                })
                if (membershipContract721._address)
                membershipContract721?.methods.balanceOf(accountAddress).call().then(res => {
                    let hasMembership = (res > 0) ? true : false
                    dispatch(setMembership(hasMembership))
                })
                */
            } catch (error) {
                console.log('error', error)
            }
        }
    }, [accountAddress, dispatch]) // eslint-disable-line

    return (
        <div className={styles.div}>
            <Header
                account={account}
                isOpenMenu={isOpenMenu}
                setIsOpenMenu={setIsOpenMenu}
                handleSetAccount={handleSetAccount}
                closeAccount={closeAccount} />
            <Route
                {...restOfProps}
                render={(props) =>
                    <Component {...props}
                        handleSetAccount={handleSetAccount}
                        account={account} />
                }
            />
            <Footer />
        </div>
    )
}

export default PrivateRoute
