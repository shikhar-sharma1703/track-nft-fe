import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import MyTrackNFT from './utils/MyTrackNFT.json';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;

const App = () => {
  const CONTRACT_ADDRESS = '0xCbb8671Dd4a62CE0c064EA88c7a301F515af5A1F';

  const [currentAccount, setCurrentAccount] = useState('');
  const [totalMintCount, setTotalMintCount] = useState(0);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log('Make sure you have ethereum!');
      return;
    } else {
      console.log('Ethereum is connected!', ethereum);
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      let account = accounts[0];
      setCurrentAccount(account);
      setupEventListener();
    } else {
      console.log('No accounts found!');
    }
  };

  useEffect(() => {
    if (currentAccount) {
      getTotalNFT();
    }
  }, [currentAccount]);

  const getTotalNFT = () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, MyTrackNFT.abi, provider.getSigner());
    contract.getTotalNFTsMinted().then(totalSupply => {
      setTotalMintCount(Number(totalSupply));
      console.log(Number(totalSupply));
    });
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Ethereum is not connected');
        return;
      }

      /*
       * Fancy method to request access to account.
       */
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err);
    }
  };

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button
      className='cta-button connect-wallet-button'
      onClick={() => {
        connectWallet();
      }}
    >
      Connect to Wallet
    </button>
  );

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, MyTrackNFT.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on('NewEpicNFTMinted', (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(
            `Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
        });

        console.log('Setup event listener!');
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const askWalletToMint = async () => {
    try {
      const { ethereum } = window;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectContract = new ethers.Contract(CONTRACT_ADDRESS, MyTrackNFT.abi, signer);

      console.log('Going to pop wallet now to pay gas...');
      let nftTxn = await connectContract.makeAnEpicNFT();

      console.log('Mining...please wait.');
      await nftTxn.wait();

      console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className='App'>
      <div className='container'>
        <div className='header-container'>
          <p className='header gradient-text'>My NFT Collection</p>
          <p className='sub-text'>Each unique. Each beautiful. Discover your NFT today.</p>
          {currentAccount ? (
            <button onClick={askWalletToMint} className='cta-button connect-wallet-button'>
              Mint NFT
            </button>
          ) : (
            renderNotConnectedContainer()
          )}
          {/* {renderNotConnectedContainer()} */}
        </div>
      </div>
      <div className='spike-img-wrapper'>
        <div className='gradient-border' id='box'>
          <img
            src={'/cowboy bebop wallpaper 02 - 1080x1920-768x1365.jpeg'}
            alt='spike'
            height='600px'
            width='300px'
            className='spike-img'
          />
        </div>
      </div>
    </div>
  );
};

export default App;
