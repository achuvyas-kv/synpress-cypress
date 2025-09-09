import { useState, useEffect } from 'react'
// import { fastTransfer, slowTransfer } from './utils'
// import { createSamplePermit, formatPermitResult } from './utils/permitUtils'

// Extend Window interface to include ethereum
declare global {
	interface Window {
		ethereum?: {
			request: (args: { method: string }) => Promise<string[]>
		}
	}
}

function App() {
	const [mode, setMode] = useState<'fast' | 'slow' | 'permit'>('fast')
	const [result, setResult] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const [amount, setAmount] = useState('1')
	const [account, setAccount] = useState<string | null>(null)
	const [isConnected, setIsConnected] = useState(false)

	const sourceChain = 'Ethereum_Sepolia'
	const destChain = 'Base_Sepolia'

	// Check if wallet is already connected on component mount
	useEffect(() => {
		checkWalletConnection()
	}, [])

	const checkWalletConnection = async () => {
		if (typeof window.ethereum !== 'undefined') {
			try {
				const accounts = await window.ethereum.request({ method: 'eth_accounts' })
				if (accounts.length > 0) {
					setAccount(accounts[0])
					setIsConnected(true)
				}
			} catch (error) {
				console.error('Error checking wallet connection:', error)
			}
		}
	}

	const connectWallet = async () => {
		if (typeof window.ethereum === 'undefined') {
			setError('MetaMask is not installed. Please install MetaMask to continue.')
			return
		}

		try {
			setLoading(true)
			setError(null)
			
			// Request account access
			const accounts = await window.ethereum.request({ 
				method: 'eth_requestAccounts' 
			})
			
			if (accounts.length > 0) {
				setAccount(accounts[0])
				setIsConnected(true)
				setResult('Wallet connected successfully!')
			}
		} catch (error) {
			console.error('Error connecting wallet:', error)
			setError(error instanceof Error ? error.message : 'Failed to connect wallet')
		} finally {
			setLoading(false)
		}
	}

	const handleTransfer = async () => {
		// Check if wallet is connected first
		if (!isConnected) {
			setError('Please connect your wallet first using the Connect Wallet button.')
			return
		}
		setResult(null)
		setError(null)
		setLoading(true)
		try {
			let result
			if (mode === 'permit') {
				// Create a permit instead of doing a transfer
				// const permitResult = await createSamplePermit()
				// result = JSON.stringify(formatPermitResult(permitResult), null, 2)
			} else if (mode === 'slow') {
				// result = await slowTransfer(sourceChain, destChain, amount)
			} else {
				// result = await fastTransfer(sourceChain, destChain, amount)
			}
			setResult(
				typeof result === 'string'
					? result
					: JSON.stringify(
						result,
						(_, v) => (typeof v === 'bigint' ? v.toString() : v),
						2,
					),
			)
			console.log('RESULT ', result)
			setError(null)
		} catch (err) {
			console.log('ERROR ', err)
			setError(err instanceof Error ? err.message : String(err))
			setResult(null)
		} finally {
			setLoading(false)
		}
	}

	const isTransferDisabled = loading || (!amount && mode !== 'permit')

	return (
		<div className="min-h-screen flex flex-col items-center justify-center font-mono p-6 bg-gray-50">
			<div className="w-full max-w-xl p-8 bg-white rounded-lg shadow-lg">
				<h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
					Bridging Kit React Demo
				</h1>

				{/* Connect Wallet Button */}
				<div className="mb-6">
					<button
						id="connectButton"
						onClick={connectWallet}
						disabled={loading}
						className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
					>
						{loading ? 'Connecting...' : 'Connect Wallet'}
					</button>
				</div>

				{/* Account Display */}
				{isConnected && (
					<div className="mb-6 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
						<strong>Connected:</strong>
						<div id="accounts" className="text-sm font-mono mt-1">
							{account}
						</div>
					</div>
				)}

				{/* Mode Selection */}
				<div className="mb-6">
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Select Mode:
					</label>
					<div className="flex space-x-2">
						{(['fast', 'slow', 'permit'] as const).map((modeOption) => (
							<button
								key={modeOption}
								onClick={() => setMode(modeOption)}
								className={`px-4 py-2 rounded text-sm font-medium transition-colors ${mode === modeOption
									? 'bg-blue-600 text-white'
									: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
									}`}
							>
								{modeOption === 'permit'
									? 'Create Permit'
									: `${modeOption} Transfer`}
							</button>
						))}
					</div>
				</div>

				{/* Amount Input (only for transfers) */}
				{mode !== 'permit' && (
					<div className="mb-6">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Amount (USDC):
						</label>
						<input
							type="number"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Enter amount"
							min="0"
							step="0.000001"
						/>
					</div>
				)}

				{/* Action Button */}
				<button
					onClick={handleTransfer}
					disabled={isTransferDisabled}
					className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
				>
					{loading
						? 'Processing...'
						: mode === 'permit'
							? 'Create Permit'
							: `${mode} Transfer`}
				</button>

				{/* Loading Indicator */}
				{loading && (
					<div className="mt-4 text-center">
						<div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
						<p className="text-sm text-gray-600 mt-2">
							{mode === 'permit'
								? 'Creating permit...'
								: 'Processing transfer...'}
						</p>
					</div>
				)}

				{/* Error Display */}
				{error && (
					<div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
						<strong>Error:</strong> {error}
					</div>
				)}

				{/* Result Display */}
				{result && (
					<div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
						<strong>
							{mode === 'permit' ? 'Permit Created!' : 'Transfer Result:'}
						</strong>
						<pre className="mt-2 text-xs overflow-auto max-h-64 bg-green-50 p-2 rounded">
							{result}
						</pre>
					</div>
				)}
			</div>

			{/* Permit Information Panel */}
			{mode === 'permit' && !loading && (
				<div className="w-full max-w-xl mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
					<h3 className="text-lg font-semibold mb-2 text-blue-800">
						About ERC-2612 Permits
					</h3>
					<p className="text-sm text-blue-700 mb-3">
						This demo creates a permit for <strong>1 USDC</strong> on{' '}
						<strong>Base Sepolia</strong> testnet. The permit allows a spender
						to transfer tokens on your behalf without requiring a separate
						approval transaction.
					</p>
					<div className="text-xs text-blue-600 space-y-1">
						<div>
							<strong>Token:</strong> USDC (Base Sepolia)
						</div>
						<div>
							<strong>Amount:</strong> 1 USDC (1,000,000 smallest units)
						</div>
						<div>
							<strong>Expiration:</strong> 1 hour from creation
						</div>
						<div>
							<strong>Spender:</strong> 0x742d...8f8e (sample address)
						</div>
						<div className="mt-2 text-blue-700">
							<strong>New Architecture:</strong> Uses composable{' '}
							<code>buildEIP2612TypedData</code> +{' '}
							<code>adapter.signTypedData</code> + <code>parseSignature</code>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default App
