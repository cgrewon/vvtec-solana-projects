import type { NextPage } from "next"
import { keyStores, connect, WalletConnection, Contract } from "near-api-js"
import { useEffect, useState } from "react"
import { Chain, OracleInfo } from "@vvtec-network/oracles"

const NearPage: NextPage = () => {
  const [wallet, setWallet] = useState<WalletConnection>()
  const [name, setName] = useState<string>()
  const [price, setPrice] = useState<string>()
  const [updatedAt, setUpdatedAt] = useState<string>()
  const [unknown, setUnknown] = useState<boolean>(false)

  useEffect(() => {
    (async () => {
      const connectionConfig = {
        networkId: "testnet",
        keyStore: new keyStores.BrowserLocalStorageKeyStore(),
        nodeUrl: "https://rpc.testnet.near.org",
        walletUrl: "https://wallet.testnet.near.org",
        helperUrl: "https://helper.testnet.near.org",
        explorerUrl: "https://explorer.testnet.near.org",
        headers: {}
      }

      const nearConnection = await connect(connectionConfig)
      const walletConnection = new WalletConnection(nearConnection, null)
      setWallet(walletConnection)
    })();
  }, [])

  useEffect(() => {
    (async () => {
      if (wallet && name) {
        const account = wallet.account()
        const oracleInfo = new OracleInfo()
        const near = await oracleInfo.inner(Chain.NEAR, {
          account,
          contractId: process.env.NEXT_PUBLIC_NEAR_CONTRACT_ID || ""
        });
        try {
          const { oracleValue, lastUpdatedAt } = await near.getCurrentValue(name)
          setUnknown(false)
          setPrice(oracleValue)
          setUpdatedAt(lastUpdatedAt)
        } catch (e: any) {
          setUnknown(true)
          setPrice("")
          setUpdatedAt("")
        }
      }
    })()
  }, [wallet, name])

  const handleConnect = () => {
    wallet?.requestSignIn()
  }

  const handleDisconnect = () => {
    wallet?.signOut()
  }

  const handleCreate = async () => {
    if (wallet && name) {
      const account = wallet.account()
      const oracleInfo = new OracleInfo()
      const near = await oracleInfo.inner(Chain.NEAR, {
        account,
        contractId: process.env.NEXT_PUBLIC_NEAR_CONTRACT_ID || ""
      });
      await near.create(name, price)
    }
  }

  const handleUpdate = async () => {
    if (wallet && name) {
      const account = wallet.account()
      const oracleInfo = new OracleInfo()
      const near = await oracleInfo.inner(Chain.NEAR, {
        account,
        contractId: process.env.NEXT_PUBLIC_NEAR_CONTRACT_ID || ""
      });
      await near.update(name, price)
    }
  }

  const handleDelete = async () => {
    if (wallet && name) {
      const account = wallet.account()
      const oracleInfo = new OracleInfo()
      const near = await oracleInfo.inner(Chain.NEAR, {
        account,
        contractId: process.env.NEXT_PUBLIC_NEAR_CONTRACT_ID || ""
      });
      await near.delete(name)
    }
  }

  if (wallet && wallet.isSignedIn()) {
    return (
      <div className="is-block">
        <div className="field">
          <label className="label">Address</label>
          <button className="button" onClick={handleDisconnect}>{wallet.getAccountId()}</button>
        </div>
        <div className="field">
          <label className="label">Name</label>
          <input
            className="input"
            placeholder="crypto.near.vvtec"
            value={name}
            onChange={e => setName(e.currentTarget.value)}
          />
        </div>
        <div className="field">
          <label className="label">Price</label>
          <input
            className="input"
            type="text"
            value={price}
            onChange={e => setPrice(e.currentTarget.value)}
          />
        </div>
        <div className="field">
          <label className="label">Updated At</label>
          <p>{updatedAt}</p>
        </div>
        <div className="field">
          <div className="buttons">
            {unknown ? (
              <button className="button" onClick={handleCreate}>Create</button>
            ) : (
              <>
                <button className="button" onClick={handleUpdate}>Update</button>
                <button className="button" onClick={handleDelete}>Delete</button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  } else {
    return (
      <div className="is-block">
        <button className="button" onClick={handleConnect}>Connect Wallet</button>
      </div>
    )
  }
}

export default NearPage