import logo from './logo.svg';
import './App.css';
import {
  ConnectButton,
  useWallet, 
  addressEllipsis,
} from '@suiet/wallet-kit';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import '@suiet/wallet-kit/style.css';
import React, { useRef, useEffect, useState } from 'react';
import Webcam from "react-webcam";
import { QRCodeSVG } from 'qrcode.react';
import jsQR from "jsqr";

function App() {

  const webcamRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);
  const [qrDetected, setQrDetected] = useState(false);
  const [qrProcessed, setQrProcessed] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [vmAddr, setVMAddr] = useState(localStorage.getItem('vmAddr') || "");
  const [showQR, setShowQR] = useState(false);
  const [queryResult, setQueryResult] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [scan, setScan] = useState(false);
  const [isWalletReady, setIsWalletReady] = useState(false);
  const [objAddr, setObjAddr] = useState("");

  const wallet = useWallet();
  const handleShowQR = () => setShowQR(true);
  const handleCloseQR = () => setShowQR(false);

  const aa = (err) => {
    console.log(err);
  };

  function invokeCamera(objectAddress) {

    setObjAddr(objectAddress);
    setScan(true);

    navigator.mediaDevices.enumerateDevices()
			.then(mediaDevices => {
				const videoDevices = mediaDevices.filter(({ kind }) => kind === "videoinput");
				setDevices(videoDevices);

				// prioritize the back camera if it exists
				const backCameraIndex = videoDevices.findIndex(device => device.label.toLowerCase().includes('back'));
				if (backCameraIndex !== -1) {
					setCurrentDeviceIndex(backCameraIndex);
				}
				setCameraReady(true);
			})
			.catch(error => {
				console.error("Error accessing camera:", error);
				setCameraReady(false);
			});
    
    console.log("haha-lol", objectAddress);
  }

  const runGraphQLQuery = async () => {
    console.log(wallet);
    const query = `
    {
      objects(
        last: 10
        filter: {
        owner: "${wallet.account.address}"
        type: "0x32bf46572bc1f2e341a3bd09d06dfc11934f72edc5458f88fdb175656c5159ef::version4::Reteta"
        }
      ) {
        edges {
          node {
            asMoveObject {
              address
              contents {
                type {
                  repr
                }
                data
              }
            }
          }
        }
      }
     }
    `;

    const response = await fetch('https://sui-testnet.mystenlabs.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      console.error('GraphQL query failed', response.status, response.statusText);
      return;
    }
  
    const result = await response.json();
    console.log(result)
    setQueryResult(result.data); 
  
    const parsedNodes = result.data.objects.edges.map(edge => {
      const { address, contents } = edge.node.asMoveObject;
      console.log(address);
      const { type, data } = contents;

      const dataFields = data.Struct.reduce((acc, field) => {
        acc[field.name] = field.value;
        return acc;
      }, {});
      
      return { type: type.repr, data: dataFields, address: address };
    });
  
    setNodes(parsedNodes);
    // console.log(parsedNodes);
  };

  // useEffect(() => {
		
	// }, []);

  useEffect(() => {
    const checkWalletInitialization = () => {
      if (wallet.status === 'connected' && wallet.account.address) {
        setIsWalletReady(true);
      } else {
        setIsWalletReady(false);
      }
    };

    checkWalletInitialization();
  }, [wallet.status]); 

  useEffect(() => {
    if (isWalletReady) {
      runGraphQLQuery(); // run the query only if the wallet is ready
    }
  }, [isWalletReady]); 

  useEffect(() => {
    console.log("mihai", objAddr);
  }, [objAddr])

  function burnNftTxnBlock(scannedUrl) {
    const txb = new TransactionBlock();
  
    // testnet contract address
    const contractAddress = scannedUrl;
      // "0x1ddf75d66e2609dc451cd35c34ebc14618ceb58183da71611506e8903cee7ddb";
    const contractModule = "versionC";
    const contractMethod = "redeem";
  
    const whitelist_addr = "0xdc9a70531293197dd7972a5146b590d3d3bd4dbb382a2e03da2e230131de880d";
    // const patient_addr = wallet.account.address;
    const nft_addr = objAddr;
    const [suiCoin] = txb.splitCoins(txb.gas, [txb.pure(1_000_000_000)]);

    txb.moveCall({
      target: `${contractAddress}::${contractModule}::${contractMethod}`,
      arguments: [
        suiCoin,
        txb.object(nft_addr),
        txb.object(whitelist_addr)
      ],
    });
  
    return txb;
  }

  const capture = async () => {
		if (webcamRef.current) {
			const imageSrc = webcamRef.current.getScreenshot();
			if (imageSrc) {
				const image = new Image();
				image.src = imageSrc;
				image.onload = async () => {
					const canvas = document.createElement('canvas');
					const context = canvas.getContext('2d');
					canvas.width = image.width;
					canvas.height = image.height;
					context.drawImage(image, 0, 0, image.width, image.height);
					const imageData = context.getImageData(0, 0, image.width, image.height);
					const code = jsQR(imageData.data, imageData.width, imageData.height);
          console.log(objAddr);
          if (code) {
            if (code.data.length > 0) {
              setQrDetected(true);
              const scannedUrl = code.data;
              alert(scannedUrl);
              setVMAddr(scannedUrl);
              localStorage.setItem('vmAddr', scannedUrl);
              console.log("Patient Addr=", vmAddr);

              console.log(">>>", objAddr);
              if (objAddr ) {
                const txb = burnNftTxnBlock(scannedUrl);
                try {
                  const res = await wallet.signAndExecuteTransactionBlock({
                    transactionBlock: txb,
                  });
                  console.log("nft burned successfully!", res);
                  alert("Succes! your Prescription is burned!");
                  setScan(false);
                } catch (e) {
                  alert("Oops, Prescription burning failed!");
                  console.error("nft burn failed", e);
                }
              }
              else {
                alert("idk what's going on?!?", objAddr);
              }
            }
					}
				};
			}
		}
	};

  useEffect(() => {
		if (cameraReady) {
      const interval = setInterval(capture, 500);
      return () => clearInterval(interval);
		}
	}, [cameraReady]);

  return (
    <>
    {wallet.status != "connected" && ( 
      <div className='authPage'>
        <img src="/images/login_pat_512.png" className="patAuthPage" />
        <h1 className="title">REȚETOMAT</h1>
        <ConnectButton/>
        {/* <p>
          <span className="gradient">Wallet status:</span> {wallet.status}
        </p> */}
      </div>
    )}

    {(wallet.status === "connected" && scan == false) && (
      <>  
        
        <center>
          <h1> Welcome <span className="gradient">{addressEllipsis(wallet.account.address)}</span></h1>
          <ConnectButton/>
          <br/>

          <button onClick={handleShowQR} className="sui-button">Show QR</button> 
          {showQR && ( 
            <div className="qrCodeOverlay" >
              <div className="qrCodePopup">
                <br />
                <button onClick={handleCloseQR} className="sui-button closeBtn">X</button> {/* btn to close the popup */}
                <br />
                <QRCodeSVG value={wallet.account.address} size={256} level={"H"} />
              </div>
            </div>
          )}

          <br />

          <div className="gridContainer">
            {nodes.map((node, index) => (
              node.type === "0x32bf46572bc1f2e341a3bd09d06dfc11934f72edc5458f88fdb175656c5159ef::version4::Reteta" && (
                <div className="gridItem" key={index}>
                  {console.log("<3",node)}
                  <p><strong>Address:</strong> {addressEllipsis(node.address)}</p>
                  <p><strong>Name:</strong> {node.data.name?.String}</p>
                  <p><strong>Price:</strong> {node.data.price?.Number}</p>
                  <p><strong>Date:</strong> {node.data.date?.String}</p>
                  <p><strong>Drugs:</strong> {node.data.drugs?.Vector.map(drug => drug.String).join(", ")}</p>
                  <p><strong>URL:</strong> <a href={node.data.image_url.Struct[0].value.String} target="_blank" rel="noopener noreferrer">Prescription Link</a></p>
                  <img width="100%" src={node.data.image_url.Struct[0].value.String} />
                  <button alt={node.address} className="sui-button" onClick={() => invokeCamera(node.address)}>Redeem</button>
                </div>
              )
            ))}
          </div>

        </center>
        
      </>
    )}

    {(wallet.status === "connected" && scan == true) && (
      <>
        <center>
          <h1 className="scannerTitle"> Scan Vending-Machine Address </h1>
          <span className="scannerBtn"><ConnectButton/></span>  
        </center>
        <div className="fadingCircle"></div>
        <img src="images/pattern2.png" className="qrMatch" />
        
        <br />
        <Webcam 
          ref={webcamRef} 
          onUserMediaError={aa} 
          audio={false}
          screenshotFormat="image/jpeg"
          style={{ margin: '0 auto', left: '0', right: '0', top:'0', height: '100%', position: 'fixed', transform: `scale(${1})`, transformOrigin: 'center' }}
        />
      </>
    )}

    </>
  );
}

export default App;
