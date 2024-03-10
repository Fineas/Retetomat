// import logo from './logo.svg';
import './App.css';
import {
  ConnectButton,
  useWallet, 
  addressEllipsis,
} from '@suiet/wallet-kit';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import '@suiet/wallet-kit/style.css';
import React, { useRef, useEffect, useState } from 'react';
// import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import axios from 'axios';
import domtoimage from "dom-to-image";
import Webcam from "react-webcam";
import jsQR from "jsqr";

function App() {

  const drugs = [
    ["Herbion", "10"],
    ["Hepa-Merz granulat", "10"],
    ["Ginko Biloba Plus", "10"],
    ["gelX ORAL SPRAY", "10"],
    ["GAVISCON", "10"],
    ["Fucidin", "10"],
    ["Fervex", "10"],
    ["Faringo Hot Drink", "10"],
    ["EXO Terfyn", "10"],
    ["Dicloreum", "10"],
    ["Coldfexin FORTE", "10"],
    ["Broncho Stop Trio", "10"],
    ["Bromhexin-t", "10"],
    ["Biafin", "10"],
    ["Aspirin", "10"],
    ["Artrocalm gel", "10"],
    ["Alprazolam LPH", "10"],
    ["Advil Raceala si Gripa", "10"],
    ["Aciclovir", "10"],
    ["Strepsils Vitamina C", "10"],
    ["Strepsils Intensiv", "10"],
    ["paxeladine", "10"],
    ["Nurofen Junior", "10"],
    ["Nurofen Immedia Ultra", "10"],
    ["Nurofen Express", "10"],
    ["NO-SPA Forte", "10"],
    ["Gaviscon Comprimate", "10"],
    ["Exoderil", "10"],
    ["Exoderil Solutie Cutanta", "10"],
    ["efferalgan", "10"],
    ["Essentiale MAX", "10"],
    ["Essentiale Forte", "10"],
    ["Diclofenac Fiterman", "10"],
    ["Diclofenac Fiterman Gel", "10"],
    ["Corneregel", "10"],
    ["Bronchicum", "10"],
    ["Bixtonim", "10"],
    ["Baneocin", "10"],
    ["Aspirin plus", "10"],
    ["ArtroStop", "10"],
    ["Antinevralgic", "10"],
    ["Antinevralgic Forte", "10"],
    ["Afrin", "10"],
    ["ACC", "10"],
  ]

  const sectionRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const webcamRef = useRef(null);

  const scrollToSection = (index) => {
    if (sectionRefs[index].current) {
      sectionRefs[index].current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }; 

  const [isHovered, setIsHovered] = useState({
    1: false, 2: false, 3: false,
    4: false, 5: false, 6: false, 
    7: false, 8: false, 9: false,
    10: false, 11: false, 12: false,
    13: false, 14: false, 15: false,
    16: false, 17: false, 18: false,
    19: false, 20: false, 21: false, 
    22: false, 23: false, 24: false,
    25: false, 26: false, 27: false,
    28: false, 29: false, 30: false, 
    31: false, 32: false, 33: false,
    34: false, 35: false, 36: false, 
    37: false, 38: false, 39: false,
    40: false, 41: false, 42: false,
    43: false, 44: false,
  });

  const toggleHover = (index, isHovering) => {
    setIsHovered({...isHovered, [index]: isHovering});
  };

  const wallet = useWallet();

  const notepadRef = useRef(null); 

  const addToPrescription = (drugName) => {
    // prescription.push(drugName);
    let p_copy = [...prescription]
    p_copy.push(drugName)
    setPrescription(p_copy)
    localStorage.setItem('prescription', JSON.stringify(p_copy));
   };

  const [prescription, setPrescription] = useState(JSON.parse(localStorage.getItem('prescription')) || []);
 
  function dropPrescription() {
    setPatientAddr("");
    setPrescription([]);
    localStorage.removeItem('patientAddr');
    localStorage.removeItem('prescription');
  }

  function get_total_price() {
    let total_price = 0;
  
    prescription.forEach((prescribedDrug) => {
      const drug = drugs.find((drug) => drug[0] === prescribedDrug);
      
      if (drug) {
        total_price += parseInt(drug[1], 10); 
      }
    });
  
    return total_price;
  }

  function getPrescriptionDrugNames(txb) {
    let total_price = 0;
    let all_drugs = [];
    prescription.forEach((prescribedDrug) => {
      const drug = drugs.find((drug) => drug[0] === prescribedDrug);
      
      if (drug) {
        all_drugs.push(drug[0])
        // total_price += parseInt(drug[1], 10); // if price is stored as a string, convert it to an integer
      }
    });
  
    return all_drugs;
  }

  function createMintNftTxnBlock(patientAddr, image_url) {
    // define programmable transaction block
    const txb = new TransactionBlock();
  
    // testnet contract address
    const contractAddress =
      "0x32bf46572bc1f2e341a3bd09d06dfc11934f72edc5458f88fdb175656c5159ef";
    const contractModule = "version4";
    const contractMethod = "mint";
  
    const whitelist_addr = "0xdc9a70531293197dd7972a5146b590d3d3bd4dbb382a2e03da2e230131de880d";
    const patient_addr = patientAddr;
    const nftName = "Patient";
    const nftDescription = "Prescription for the Patient";
    const nftImgUrl = image_url;
    const price = get_total_price();
    const date = new Date().toLocaleString();
    const drugs = getPrescriptionDrugNames(txb);
  
    console.log("Transaction:", whitelist_addr, patient_addr, nftName, nftDescription, price, date, drugs, nftImgUrl);

    txb.moveCall({
      target: `${contractAddress}::${contractModule}::${contractMethod}`,
      arguments: [
        txb.object(whitelist_addr),
        txb.pure.address(patient_addr),
        txb.pure.string(nftName),
        txb.pure.string(nftDescription),
        txb.pure.u64(price),
        txb.pure.string(date),
        txb.pure(drugs),
        txb.pure.string(nftImgUrl),
      ],
    });
  
    return txb;
  }

  const captureAndUploadScreenshot = async () => {
    if (notepadRef.current) {
      const blob = await domtoimage.toBlob(notepadRef.current);
      // // save the screenshot locally
      saveAs(blob, 'tmp_prescription.png');

        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64data = reader.result;
          console.log(base64data);
          try {
            const response = await axios.post('https://api.imgur.com/3/image', {
              image: base64data.split(',')[1] 
            }, {
              headers: {
                Authorization: 'Client-ID 0959d07b76a10b6',
              }
            });

            let image_url = response.data.data.link
            console.log("UPLOADED ULR=", image_url);
            
            const txb = createMintNftTxnBlock(patientAddr, image_url);
            try {
              // call the wallet to sign and execute the transaction
              const res = await wallet.signAndExecuteTransactionBlock({
                transactionBlock: txb,
              });
              console.log("nft minted successfully!", res);
              alert("Succes! your Prescription is minted!");
              setPrescription([]);
              localStorage.removeItem('prescription');
            } catch (e) {
              alert("Oops, Prescription minting failed!");
              console.error("nft mint failed", e);
            }

          } catch (error) {
            console.error('Failed to upload image:', error);
          }
        };
        reader.readAsDataURL(blob);
    }
  };

  const aa = (err) => {
    console.log(err);
  };

  const handleScan = (data) => {
    if (data) {
      console.log("QR Code data:", data);
    }
  };

  const [cameraReady, setCameraReady] = useState(false);
  const [devices, setDevices] = useState([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);
  const [qrDetected, setQrDetected] = useState(false);
  const [qrProcessed, setQrProcessed] = useState(false);
  const [patientAddr, setPatientAddr] = useState(localStorage.getItem('patientAddr') || "");

	useEffect(() => {
		navigator.mediaDevices.enumerateDevices()
			.then(mediaDevices => {
				const videoDevices = mediaDevices.filter(({ kind }) => kind === "videoinput");
				setDevices(videoDevices);

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
	}, []);

  useEffect(() => {
		if (cameraReady) {
			const interval = setInterval(capture, 500);
			return () => clearInterval(interval);
		}
	}, [cameraReady]);

  useEffect(() => {
		console.log(prescription);
	}, [prescription]);

  const capture = () => {
		if (webcamRef.current) {
			const imageSrc = webcamRef.current.getScreenshot();
			if (imageSrc) {
				const image = new Image();
				image.src = imageSrc;
				image.onload = () => {
					const canvas = document.createElement('canvas');
					const context = canvas.getContext('2d');
					canvas.width = image.width;
					canvas.height = image.height;
					context.drawImage(image, 0, 0, image.width, image.height);
					const imageData = context.getImageData(0, 0, image.width, image.height);
					const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            if (code.data.length > 0) {
              setQrDetected(true);
              const scannedUrl = code.data;
              alert(scannedUrl);
              setPatientAddr(scannedUrl);
              localStorage.setItem('patientAddr', scannedUrl);
              console.log("Patient Addr=", patientAddr);
            }
					}
				};
			}
		}
	};



  return (
    <>
      {wallet.status != "connected" && ( 
        <div className='authPage'>
          <img src="/images/login_doc3_512.png" className="patAuthPage" />
          <h1 className="title">REȚETOMAT</h1>
          <ConnectButton/>
          {/* <p>
            <span className="gradient">Wallet status:</span> {wallet.status}
          </p> */}
        </div>
      )}

      {(wallet.status === "connected" && patientAddr == "") && (
        <>  
          
          <center>
            <h1 className="scannerTitle"> Scan Patient Address </h1>
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

      {(wallet.status === "connected" && patientAddr.length > 0) && ( 
        <div className="wholePage">
          <div className="fullScreenStyle">
            <div className="leftContent">
              <div className="leftBoxStyle">
                <center><ConnectButton/></center>
                <br />
                <div id="prescription" ref={notepadRef}>
                  <div className="notepad" >
                    <div className="top"></div>
                    <div className="paper" contentditable="true">
                      Patient: <span className="redtxt">{patientAddr}</span>
                      {prescription.map(pres  => (
                        <p style={{margin: '0'}}>{pres}</p>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={dropPrescription} className='dropBtn'>♻️ ABANDON</button>
                <button onClick={captureAndUploadScreenshot} className='mintBtn'>🔥 MINT</button>
                {/* <p>
                <span className="gradient">Wallet status:</span> {wallet.status}
                </p>   */}
              </div> {/* Blue Box */}
            </div>
            <div className="scrollableContentStyle">
              <div className="container">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44].map((index) => (
                <div ref={sectionRefs[index]} className="contentSection">
                  <div className="grid">
                    <figure className="effect-sadie">
                    <img className="displayImage" src={`/images/${index + 1}.jpeg`} alt={`Section ${index}`} />
                      <figcaption>
                        <h2><span>{drugs[index-1][0]}</span></h2>
                        <br />
                        <button className="sui-button" onClick={() => addToPrescription(drugs[index-1][0])}>+</button>
                      </figcaption>			
                    </figure>
                  </div>
                </div>
              ))}
              </div>
              
            </div>
          </div>
          <div className="navigationMenuStyle">
            {/* Navigation Menu */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44].map((index) => (
              <img
                key={index}
                src={`/images/${index + 1}.jpeg`}
                alt={`Navigate to Section ${index + 1}`}
                className='navigationItem'
                onClick={() => scrollToSection(index)}
              />
          ))}
          </div>
        </div>
      )}
    </>
  );
}

export default App;