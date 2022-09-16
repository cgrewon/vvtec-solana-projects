import * as anchor from '@project-serum/anchor'
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import type { NextPage } from "next"
import { Chain, OracleInfo } from "@vvtec-network/oracles"
import { useEffect, useState } from 'react'

const SolanaPage: NextPage = () => {
  const wallet = useAnchorWallet()
  const connection = useConnection()

  const [oracleAddress, setOracleAddress] = useState<string>()
  const [name, setName] = useState<string>()
  const [price, setPrice] = useState<string>()
  const [updatedAt, setUpdatedAt] = useState<string>()
  const [unknown, setUnknown] = useState<boolean>(true)

  async function getProvider() {
    const provider = wallet && new anchor.AnchorProvider(connection.connection, wallet, {
      commitment: "processed"
    })
    return provider
  }

  useEffect(() => {
    (async () => {
      const provider = await getProvider()
      if (provider && name) {
        const oracleInfo = new OracleInfo()
        const solana = await oracleInfo.inner(Chain.SOLANA, provider);
        try {
          const { oracleValue, lastUpdatedAt, address } = await solana.getCurrentValue(name)
          setUnknown(false)
          setOracleAddress(address)
          setPrice(oracleValue)
          setUpdatedAt(lastUpdatedAt)
        } catch (e) {
          setUnknown(true)
          setPrice("")
          setUpdatedAt("")
        }
      }
    })();
  }, [wallet, connection.connection, name])

  const handleCreate = async () => {
    const provider = await getProvider()
    if (provider && name) {
      const oracleInfo = new OracleInfo()
      const solana = await oracleInfo.inner(Chain.SOLANA, provider);
      const { oracleValue, lastUpdatedAt, address } = await solana.create(name, price)
      setUnknown(false)
      setOracleAddress(address)
      setPrice(oracleValue)
      setUpdatedAt(lastUpdatedAt)
    }
  }

  const handleUpdate = async () => {
    const provider = await getProvider()
    if (provider && name) {
      const oracleInfo = new OracleInfo()
      const solana = await oracleInfo.inner(Chain.SOLANA, provider);
      const { oracleValue, lastUpdatedAt, address } = await solana.update(name, price)
      setUnknown(false)
      setOracleAddress(address)
      setPrice(oracleValue)
      setUpdatedAt(lastUpdatedAt)
    }
  }

  const handleDelete = async () => {
    const provider = await getProvider()
    if (provider && name) {
      const oracleInfo = new OracleInfo()
      const solana = await oracleInfo.inner(Chain.SOLANA, provider);
      await solana.delete(name)
      setUnknown(true)
      setPrice("")
      setUpdatedAt("")
    }
  }

  return (
    <div className="is-block">
      <div className="is-flex is-justify-content-center my-3">
        <WalletMultiButton />
      </div>
      <div>
        <div className="field">
          <label className="label">Name</label>
          <input
            className="input"
            placeholder="crypto.sol.usdc"
            value={name}
            onChange={e => setName(e.currentTarget.value)}
          />
        </div>
        <div className="field">
          <label className="label">Address</label>
          <p>{oracleAddress}</p>
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
    </div>
  )
}

export default SolanaPage