# Crypto


## Instructions

Remplacer le lien de la DB mongoDb par le lien de ta DB creer. Il s'agit d'un lien que tu pourra juste copier coller dans le fichier server.js

Ensuite, deployer l'API sur render pour l'utiliser sur Framer.

# Integration blockchain 


## 1. Charger ethers.js dans Framer

Dans le fichier MyEthersLoader.tsx (nom au choix), copie ceci :


```tsx
import { useEffect } from "react"

export function EthersLoader() {
    useEffect(() => {
        const script = document.createElement("script")
        script.src =
            "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js"
        script.async = true
        script.onload = () => console.log("Ethers.js chargé")
        document.head.appendChild(script)
    }, [])

    return null
}
```



## 2. Créer un bouton pour connecter Metamask

Nouveau fichier dans Framer : ConnectWallet.tsx


```tsx
import { useState } from "react"

export function ConnectWallet() {
    const [account, setAccount] = useState("")

    async function connect() {
        if (!window.ethereum) return alert("Installe Metamask")

        const provider = new window.ethers.providers.Web3Provider(window.ethereum)
        await provider.send("eth_requestAccounts", [])
        const signer = provider.getSigner()
        const address = await signer.getAddress()
        setAccount(address)
    }

    return (
        <div>
            <button onClick={connect} style={{ padding: "12px 24px" }}>
                Connecter Wallet
            </button>
            {account && <p>Adresse : {account}</p>}
        </div>
    )
}
```

## 3. Ajouter Avalanche automatiquement à Metamask (facultatif)

Même fichier ou un autre (AddAvalancheButton.tsx) :


```tsx
export function AddAvalancheButton() {
    async function addAvalancheNetwork() {
        await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
                chainId: "0xa86a",
                chainName: "Avalanche C-Chain",
                nativeCurrency: {
                    name: "Avalanche",
                    symbol: "AVAX",
                    decimals: 18,
                },
                rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
                blockExplorerUrls: ["https://snowtrace.io"],
            }],
        })
    }

    return (
        <button onClick={addAvalancheNetwork}>
            Ajouter réseau Avalanche
        </button>
    )
}
```

## 5. Lire et écrire dans ton contrat depuis Framer

Nouveau fichier MessageInteraction.tsx


```tsx
import { useState } from "react"

const contractAddress = "0x...TON_ADRESSE"
const abi = [
    "function message() view returns (string)",
    "function setMessage(string _msg)",
]

export function MessageInteraction() {
    const [message, setMessage] = useState("")
    const [newMessage, setNewMessage] = useState("")

    async function getMessage() {
        const provider = new window.ethers.providers.Web3Provider(window.ethereum)
        const contract = new window.ethers.Contract(contractAddress, abi, provider)
        const msg = await contract.message()
        setMessage(msg)
    }

    async function sendMessage() {
        const provider = new window.ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new window.ethers.Contract(contractAddress, abi, signer)
        const tx = await contract.setMessage(newMessage)
        await tx.wait()
        alert("Message envoyé !")
        setNewMessage("")
    }

    return (
        <div>
            <button onClick={getMessage}>Lire message</button>
            <p>{message}</p>
            <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Nouveau message"
            />
            <button onClick={sendMessage}>Envoyer message</button>
        </div>
    )
}
```