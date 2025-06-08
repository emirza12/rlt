## 1. 🎯 Pitch

RLUSD+ enables RLUSD stablecoin holders to earn real-world yield (simulated at 5% APY) by depositing tokens into XRPL “vaults.” In return, users receive a transferable MPToken with clawback functionality and identity verification for RWA compliance.

## 2. 🎥 Demo Video

👉 Watch the demo (YouTube / Loom)

https://www.loom.com/share/cfa183bed4574a2ba79bf5a70c192812?sid=c6c3c931-53dc-4bef-82eb-9235bfad79e1

Demo highlights:
	•	Minting of RLUSD+ after deposit
	•	Real-time yield accumulation
	•	Identity compliance mock flow
	•	Withdrawal process

DevHack Tip: A 3–5 minute walkthrough combining live demo and technical explanation is highly effective  ￼.

## 3. 📸 Screenshots

<img width="1283" alt="Screenshot 2025-06-08 at 10 15 57" src="https://github.com/user-attachments/assets/c4636a11-3622-4b7f-b504-0fdf84164681" />
<img width="1267" alt="Screenshot 2025-06-08 at 10 16 10" src="https://github.com/user-attachments/assets/abab0fee-4b27-428e-9142-2e549b74eb4f" />

## 4. ⚙️ How It Works on XRPL

a) Deposit → Mint RLUSD+
	•	User sends RLUSD to the vault via Payment.
	•	Backend records wallet, amount, and timestamp.
	•	MPToken RLUSD+ is minted by the issuer and sent via Payment.
	•	User establishes a TrustSet for RLUSD+ token.

b) Simulated Yield
	•	Backend calculates yield as 5% APY * (now – depositTime).
	•	RLUSD+ balance is adjusted accordingly (via rebase or updated display).

c) Clawback & Compliance
	•	The token is configured with a Clawback policy.
	•	Admin can trigger a clawback to reclaim a portion if necessary.

d) Withdrawal & Burn
	•	User burns their RLUSD+ using Payment back to the issuer.
	•	User receives original RLUSD + simulated yield (minus 0.1–0.3% withdrawal fee).

All transactions occur on XRPL Testnet and are fully visible, fulfilling hackathon XRPL criteria  ￼.


## 5. 🧪 Setup Instructions
```bash
git clone https://github.com/YourRepo/RLUSDPlus.git
cd RLUSDPlus
npm install         # frontend dependencies
pip install -r requirements.txt  # backend dependencies
```

## 7. 📚 Tech Stack
	•	Frontend: Nuxt
	•	Backend: Node.js 
	•	XRPL Integration: xrpl.js, MPToken issuance + clawback, Payment, TrustSet, Vault
	•	Yield Simulation: Off-chain module using a <3.5% APY model


## 8. 🚀 Roadmap
	•	Integrate real RWA oracles via OpenEden
	•	Automate on-chain yield with Hooks/XLS30
	•	List RLUSD+ on XRPL DEX
	•	Add real DID verification for regulatory compliance
