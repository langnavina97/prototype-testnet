import React, { Component } from "react";
import IndexSwap from "./abis/IndexSwap.json";
import IndexToken from "./abis/indexToken.json";
import NFTSwap from "./abis/NFTPortfolio.json";
import IERC from "./abis/IERC20.json";
import pancakeSwapRouter from "./abis/IPancakeRouter02.json";
import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';
import { Grid, Button, Card, Form, Input, Image, Label, Menu, Table } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import velvet from "./velvet.png";
import metamask from "./metamask-fox.svg";
import swal from 'sweetalert';

import "./App.css";

const axios = require('axios');

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      account: '',
      SwapContract: null,
      NFTTokenContract: null,
      DeFiTokenContract: null,
      NFTPortfolioContract: null,
      address: "",
      connected: false,
      mapDefi: [],
      mapNft: [],

      defiToMint: 0,
      nftToMint: 0,

      withdrawValueDefi: 0,
      withdrawValueNFT: 0,

      defiBalance: 0,
      nftBalance: 0,

      nftTokenBalance: 0,
      defiTokenBalance: 0,

      btcTokenBalance: 0,
      ethTokenBalance: 0,
      shibaTokenBalance: 0,
      xrpTokenBalance: 0,
      ltcTokenBalance: 0,
      daiTokenBalance: 0,
      lunaTokenBalance: 0,
      linkTokenBalance: 0,
      uniTokenBalance: 0,
      stethTokenBalance: 0,

      btcTokenBalanceBnb: 0,
      ethTokenBalanceBnb: 0,
      shibaTokenBalanceBnb: 0,
      xrpTokenBalanceBnb: 0,
      ltcTokenBalanceBnb: 0,
      daiTokenBalanceBnb: 0,
      lunaTokenBalanceBnb: 0,
      linkTokenBalanceBnb: 0,
      uniTokenBalanceBnb: 0,
      stethTokenBalanceBnb: 0,

      axsTokenBalance: 0,
      manaTokenBalance: 0,
      sandTokenBalance: 0,
      thetaTokenBalance: 0,
      flowTokenBalance: 0,
      xtzTokenBalance: 0,
      galaTokenBalance: 0,
      chzTokenBalance: 0,
      enjTokenBalance: 0,
      roseTokenBalance: 0,

      axsTokenBalanceBnb: 0,
      manaTokenBalanceBnb: 0,
      sandTokenBalanceBnb: 0,
      thetaTokenBalanceBnb: 0,
      flowTokenBalanceBnb: 0,
      xtzTokenBalanceBnb: 0,
      galaTokenBalanceBnb: 0,
      chzTokenBalanceBnb: 0,
      enjTokenBalanceBnb: 0,
      roseTokenBalanceBnb: 0,

      rate: 0
    }
  }

  async componentDidMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
    await this.calcTokenDeFiBalances();
    await this.calcTokenNFTBalances();
    await this.getRate();
  }

  // first up is to detect ethereum provider
  async loadWeb3() {
    const provider = await detectEthereumProvider();

    // modern browsers
    if (provider) {
      console.log('MetaMask is connected');

      window.web3 = new Web3(provider);
    } else {
      console.log('No ethereum wallet detected');
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await window.web3.eth.getAccounts();
    if(accounts[0]) {
      this.setState({ connected: true })
    }
    this.setState({ account: accounts[0]}) 
    
    const SwapContract = new web3.eth.Contract(IndexSwap.abi, "0xC773887b60191926d9995DB3072D212478ce235A");
    const NFTPortfolioContract = new web3.eth.Contract(NFTSwap.abi, "0x0f444D6F25d2F8Fd0639eEc68ce4AA1F03FF6F4F");
    const NFTTokenContract = new web3.eth.Contract(IndexToken.abi, "0x817ea2A5Fd281d15CA70B05abB5E094356C42996");
    const DeFiTokenContract = new web3.eth.Contract(IndexToken.abi, "0xF70538622598232a95B1EC1914Fc878d28EBAE68");
    this.setState({ SwapContract, NFTTokenContract, DeFiTokenContract, NFTPortfolioContract});
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    })
  }

  connectWallet = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      console.log("Connected");
      this.setState({
        connected: true
      })

    } else {
      alert("Metamask not found");
    }

    this.loadBlockchainData();
    window.location.reload()
  }

  investNFT = async () => {
    const web3 = new Web3(window.ethereum);
    const v = this.state.nftToMint;
    const valueInWei = web3.utils.toWei(v, 'ether');
    console.log(this.state.NFTPortfolioContract.methods);
    
    const resp = await this.state.NFTPortfolioContract.methods.investInFundDefi().send({ from: this.state.account, value: valueInWei
    }).once("receipt", (receipt) => {
      console.log(receipt);
    })
      .catch((err) => {
        console.log(err);
      });
    if (resp.status) {
      swal("Investment successfull!", `You invested ${v} BNB into the portfolio.`, "success");
    } else {
      swal("Investment failed!");
    }

    this.calcTokenNFTBalances();
  }

  investDeFi = async () => {
    const web3 = new Web3(window.ethereum);    
    const v = this.state.defiToMint;
    const valueInWei = web3.utils.toWei(v, 'ether');
    
    const resp = await this.state.SwapContract.methods.investInFundDefi().send({ from: this.state.account, value: valueInWei })
    .once("receipt", (receipt) => {
      console.log(receipt);

    })
      .catch((err) => {
        console.log(err);
      });

      if (resp.status) {
        swal("Investment successfull!", `You invested ${v} BNB into the portfolio.`, "success");
        //window.location.reload();
      } else {
        swal("Investment failed!");
      }

    this.calcTokenDeFiBalances();

  }

  approveNFTTokens = async() => {
    const web3 = new Web3(window.ethereum);  

    const aXSTokenConntract = new web3.eth.Contract(IERC.abi, "0xf34D883EcdE3238B153f38230987a0F4c221a48F");
    await aXSTokenConntract.methods.approve("0x0f444D6F25d2F8Fd0639eEc68ce4AA1F03FF6F4F", "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: "0x6056773C28c258425Cf9BC8Ba5f86B8031863164" });

    const mANATokenConntract = new web3.eth.Contract(IERC.abi, "0x8bf2dF0Ff8528088475183a68678bd1Cd7691b69");
    await mANATokenConntract.methods.approve("0x0f444D6F25d2F8Fd0639eEc68ce4AA1F03FF6F4F", "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: "0x6056773C28c258425Cf9BC8Ba5f86B8031863164" });

    const sANDTokenConntract = new web3.eth.Contract(IERC.abi, "0x1631A54AC95Ecb0085dB6b8ACf80c4Cee72AEB06");
    await sANDTokenConntract.methods.approve("0x0f444D6F25d2F8Fd0639eEc68ce4AA1F03FF6F4F", "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: "0x6056773C28c258425Cf9BC8Ba5f86B8031863164" });

    const tHETATokenConntract = new web3.eth.Contract(IERC.abi, "0x19A5E53eC7B385dbE2E587Ba989eA2AB8F7EaF1e");
    await tHETATokenConntract.methods.approve("0x0f444D6F25d2F8Fd0639eEc68ce4AA1F03FF6F4F", "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: "0x6056773C28c258425Cf9BC8Ba5f86B8031863164" });

    const fLOWTokenConntract = new web3.eth.Contract(IERC.abi, "0xe5c48084E1974a971Bd5dF4d9B01daCCA86d5567");
    await fLOWTokenConntract.methods.approve("0x0f444D6F25d2F8Fd0639eEc68ce4AA1F03FF6F4F", "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: "0x6056773C28c258425Cf9BC8Ba5f86B8031863164" });

    const xTZTokenConntract = new web3.eth.Contract(IERC.abi, "0xC5De9d5B0BA5b408a3e9530A1BC310d8F2dCC26a");
    await xTZTokenConntract.methods.approve("0x0f444D6F25d2F8Fd0639eEc68ce4AA1F03FF6F4F", "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: "0x6056773C28c258425Cf9BC8Ba5f86B8031863164" });

    const gALATokenConntract = new web3.eth.Contract(IERC.abi, "0x4bf1CE8E4c4c86126E57Fa9fc3f1a9631661641c");
    await gALATokenConntract.methods.approve("0x0f444D6F25d2F8Fd0639eEc68ce4AA1F03FF6F4F", "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: "0x6056773C28c258425Cf9BC8Ba5f86B8031863164" });

    const cHZTokenConntract = new web3.eth.Contract(IERC.abi, "0xdeEC6f0C22970b9b8a47069bE619bfAe646dEe26");
    await cHZTokenConntract.methods.approve("0x0f444D6F25d2F8Fd0639eEc68ce4AA1F03FF6F4F", "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: "0x6056773C28c258425Cf9BC8Ba5f86B8031863164" });

    const eNJTokenConntract = new web3.eth.Contract(IERC.abi, "0xb08A1959f57b9cC8e5A5F1d329EfD90EE3438F65");
    await eNJTokenConntract.methods.approve("0x0f444D6F25d2F8Fd0639eEc68ce4AA1F03FF6F4F", "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: "0x6056773C28c258425Cf9BC8Ba5f86B8031863164" });

    const rOSETokenConntract = new web3.eth.Contract(IERC.abi, "0x30c1AC77F4068A063648B549ffF96Ddb9d151325");
    await rOSETokenConntract.methods.approve("0x0f444D6F25d2F8Fd0639eEc68ce4AA1F03FF6F4F", "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: "0x6056773C28c258425Cf9BC8Ba5f86B8031863164" });
  }

  approveDeFiTokens = async() => {
    const web3 = new Web3(window.ethereum);  
    const contractAddress = "0xC773887b60191926d9995DB3072D212478ce235A";
    const vault = "0x6056773C28c258425Cf9BC8Ba5f86B8031863164";

    const BTCTokenConntract = new web3.eth.Contract(IERC.abi, "0x4b1851167f74FF108A994872A160f1D6772d474b");
    BTCTokenConntract.methods.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: vault });

    const ETHTokenConntract = new web3.eth.Contract(IERC.abi, "0x8BaBbB98678facC7342735486C851ABD7A0d17Ca");
    ETHTokenConntract.methods.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: vault });

    const SHIBATokenConntract = new web3.eth.Contract(IERC.abi, "0xBf0646Fa5ABbFf6Af50a9C40D5E621835219d384");
    SHIBATokenConntract.methods.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: vault });

    const XRPTokenConntract = new web3.eth.Contract(IERC.abi, "0xCc00177908830cE1644AEB4aD507Fda3789128Af");
    XRPTokenConntract.methods.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: vault });

    const LTCTokenConntract = new web3.eth.Contract(IERC.abi, "0x2F9fd65E3BB89b68a8e2Abd68Db25F5C348F68Ee");
    LTCTokenConntract.methods.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: vault });

    const DAITokenConntract = new web3.eth.Contract(IERC.abi, "0x8a9424745056Eb399FD19a0EC26A14316684e274");
    DAITokenConntract.methods.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: vault });

    const LUNATokenConntract = new web3.eth.Contract(IERC.abi, "0x0bBF12a9Ccd7cD0E23dA21eFd3bb16ba807ab069");
    LUNATokenConntract.methods.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: vault });

    const LINKTokenConntract = new web3.eth.Contract(IERC.abi, "0x8D908A42FD847c80Eeb4498dE43469882436c8FF");
    LINKTokenConntract.methods.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: vault });

    const UNITokenConntract = new web3.eth.Contract(IERC.abi, "0x62955C6cA8Cd74F8773927B880966B7e70aD4567");
    UNITokenConntract.methods.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: vault });

    const STETHTokenConntract = new web3.eth.Contract(IERC.abi, "0xb7a58582Df45DBa8Ad346c6A51fdb796D64e0898");
    STETHTokenConntract.methods.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: vault });
  }

  withdrawDeFi = async () => {
    var vault = "0x6056773C28c258425Cf9BC8Ba5f86B8031863164";

    const web3 = new Web3(window.ethereum);

    var withdrawAmt = this.state.withdrawValueDefi;
    var withdrawAmountInWei = web3.utils.toWei(withdrawAmt, 'ether');

    const defiBalance = await this.state.DeFiTokenContract.methods.balanceOf(this.state.account).call();
    if(defiBalance == 0) {
      swal("Withdrawal amount exceeds balance!");
      return;
    }

    var percentage = (withdrawAmountInWei * 100) / defiBalance ;
    var percentageFinal = Math.round(percentage);
    console.log(Math.round(percentage));

    await this.state.DeFiTokenContract.methods.approve("0xC773887b60191926d9995DB3072D212478ce235A", "7787357773333787487837458347754874574837458374")
    .send({from: this.state.account});

    var amount = withdrawAmountInWei;
    var sAmount = amount.toString();

    await this.state.SwapContract.methods.withdrawFromFundTOPTokens(sAmount, percentageFinal
    ).send({
      from: this.state.account, value: 0
    }).once("receipt", (receipt) => {
      swal("Withdrawal successfull!", "The withdrawal was successful!", "success");
      console.log(receipt);
    })
      .catch((err) => {
        console.log(err);
      });

      this.calcTokenDeFiBalances();
  }

  withdrawNFT = async () => {
    var vault = "0x6056773C28c258425Cf9BC8Ba5f86B8031863164";

    const web3 = new Web3(window.ethereum);

    var withdrawAmt = this.state.withdrawValueNFT;
    var withdrawAmountInWei = web3.utils.toWei(withdrawAmt, 'ether');

    const nftBalance = await this.state.NFTTokenContract.methods.balanceOf(this.state.account).call();
    if(nftBalance == 0) {
      swal("Withdrawal amount exceeds balance!");
      return;
    }

    var percentage = (withdrawAmountInWei * 100) / nftBalance ;
    var percentageFinal = Math.round(percentage);
    console.log(Math.round(percentage));
  
    await this.state.NFTTokenContract.methods.approve("0x0f444D6F25d2F8Fd0639eEc68ce4AA1F03FF6F4F", "7787357773333787487837458347754874574837458374")
    .send({from: this.state.account});

    var amount = withdrawAmountInWei;
    var sAmount = amount.toString();

    await this.state.NFTPortfolioContract.methods.withdrawFromFundNFT(sAmount, percentageFinal
    ).send({
      from: this.state.account, value: 0
    }).once("receipt", (receipt) => {
      swal("Withdrawal successfull!", "The withdrawal was successful!", "success");
      console.log(receipt);
    })
      .catch((err) => {
        console.log(err);
      });

      this.calcTokenNFTBalances();
  }

  getExchangeRate = async (amountIn, address) => {
    const web3 = window.web3;
    const pancakeRouter = new web3.eth.Contract(pancakeSwapRouter.abi, "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3");

    var path = [];
    path[0] = address;
    path[1] = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";

    const er = await pancakeRouter.methods.getAmountsOut(amountIn, path).call();
    return er[1];
  }

  calcTokenDeFiBalances = async () => {
    const web3 = window.web3;

    const defiTokenBalanceRes = await this.state.DeFiTokenContract.methods.balanceOf(this.state.account).call();
    const defiTokenBalance = web3.utils.fromWei(defiTokenBalanceRes, "ether");
    
    const btcTokenBalanceRes = await this.state.SwapContract.methods.btcBalance(this.state.account).call();
    const helperBtc = await this.getExchangeRate(btcTokenBalanceRes, "0x4b1851167f74FF108A994872A160f1D6772d474b");
    const btcTokenBalanceBnb = web3.utils.fromWei(helperBtc, "ether");
    const btcTokenBalance = web3.utils.fromWei(btcTokenBalanceRes, "ether");

    const ethTokenBalanceRes = await this.state.SwapContract.methods.ethBalance(this.state.account).call();
    const helperEth = await this.getExchangeRate(ethTokenBalanceRes, "0x8BaBbB98678facC7342735486C851ABD7A0d17Ca");
    const ethTokenBalanceBnb = web3.utils.fromWei(helperEth, "ether");
    const ethTokenBalance = web3.utils.fromWei(ethTokenBalanceRes, "ether");
    console.log("eth", ethTokenBalance);

    const shibaTokenBalanceRes = await this.state.SwapContract.methods.shibaBalance(this.state.account).call();
    const helperShib = await this.getExchangeRate(shibaTokenBalanceRes, "0xBf0646Fa5ABbFf6Af50a9C40D5E621835219d384");
    const shibaTokenBalanceBnb = web3.utils.fromWei(helperShib, "ether");
    const shibaTokenBalance = web3.utils.fromWei(shibaTokenBalanceRes, "ether");

    const xrpTokenBalanceRes = await this.state.SwapContract.methods.xrpBalance(this.state.account).call();
    const helperXrp = await this.getExchangeRate(xrpTokenBalanceRes, "0xCc00177908830cE1644AEB4aD507Fda3789128Af");
    const xrpTokenBalanceBnb = web3.utils.fromWei(helperXrp, "ether");
    const xrpTokenBalance = web3.utils.fromWei(xrpTokenBalanceRes, "ether");

    const ltcTokenBalanceRes = await this.state.SwapContract.methods.ltcBalance(this.state.account).call();
    const helperLtc = await this.getExchangeRate(ltcTokenBalanceRes, "0x2F9fd65E3BB89b68a8e2Abd68Db25F5C348F68Ee");
    const ltcTokenBalanceBnb = web3.utils.fromWei(helperLtc, "ether");
    const ltcTokenBalance = web3.utils.fromWei(ltcTokenBalanceRes, "ether");

    const daiTokenBalanceRes = await this.state.SwapContract.methods.daiBalance(this.state.account).call();
    const helperDai = await this.getExchangeRate(daiTokenBalanceRes, "0x8a9424745056Eb399FD19a0EC26A14316684e274");
    const daiTokenBalanceBnb = web3.utils.fromWei(helperDai, "ether");
    const daiTokenBalance = web3.utils.fromWei(daiTokenBalanceRes, "ether");

    const lunaTokenBalanceRes = await this.state.SwapContract.methods.lunaBalance(this.state.account).call();
    const helperLuna = await this.getExchangeRate(lunaTokenBalanceRes, "0x0bBF12a9Ccd7cD0E23dA21eFd3bb16ba807ab069");
    const lunaTokenBalanceBnb = web3.utils.fromWei(helperLuna, "ether");
    const lunaTokenBalance = web3.utils.fromWei(lunaTokenBalanceRes, "ether");

    const linkTokenBalanceRes = await this.state.SwapContract.methods.linkBalance(this.state.account).call();
    const helperLink = await this.getExchangeRate(linkTokenBalanceRes, "0x8D908A42FD847c80Eeb4498dE43469882436c8FF");
    const linkTokenBalanceBnb = web3.utils.fromWei(helperLink, "ether");
    const linkTokenBalance = web3.utils.fromWei(linkTokenBalanceRes, "ether");

    const uniTokenBalanceRes = await this.state.SwapContract.methods.uniBalance(this.state.account).call();
    const helperUni = await this.getExchangeRate(uniTokenBalanceRes, "0x62955C6cA8Cd74F8773927B880966B7e70aD4567");
    const uniTokenBalanceBnb = web3.utils.fromWei(helperUni, "ether");
    const uniTokenBalance = web3.utils.fromWei(uniTokenBalanceRes, "ether");


    const stethTokenBalanceRes = await this.state.SwapContract.methods.stethBalance(this.state.account).call();
    const helperSteth = await this.getExchangeRate(stethTokenBalanceRes, "0xb7a58582Df45DBa8Ad346c6A51fdb796D64e0898");
    const stethTokenBalanceBnb = web3.utils.fromWei(helperSteth, "ether");
    const stethTokenBalance = web3.utils.fromWei(stethTokenBalanceRes, "ether");
    console.log("steth", stethTokenBalance);

    this.setState({
      defiTokenBalance,
      btcTokenBalance, ethTokenBalance, shibaTokenBalance, xrpTokenBalance, ltcTokenBalance,
      btcTokenBalanceBnb, ethTokenBalanceBnb, shibaTokenBalanceBnb, xrpTokenBalanceBnb, ltcTokenBalanceBnb,
      daiTokenBalance, lunaTokenBalance, linkTokenBalance, uniTokenBalance, stethTokenBalance,
      daiTokenBalanceBnb, lunaTokenBalanceBnb, linkTokenBalanceBnb, uniTokenBalanceBnb, stethTokenBalanceBnb,
    });
  }

    calcTokenNFTBalances = async () => {
      const web3 = window.web3;

      const nftTokenBalanceRes = await this.state.NFTTokenContract.methods.balanceOf(this.state.account).call();
      const nftTokenBalance = web3.utils.fromWei(nftTokenBalanceRes, "ether");
    
      const axsTokenBalanceRes = await this.state.NFTPortfolioContract.methods.axsBalance(this.state.account).call();
      const helperAxs = await this.getExchangeRate(axsTokenBalanceRes, "0xf34D883EcdE3238B153f38230987a0F4c221a48F");
      const axsTokenBalanceBnb = web3.utils.fromWei(helperAxs, "ether");
      const axsTokenBalance = web3.utils.fromWei(axsTokenBalanceRes, "ether");

      const manaTokenBalanceRes = await this.state.NFTPortfolioContract.methods.manaBalance(this.state.account).call();
      const helperMana = await this.getExchangeRate(manaTokenBalanceRes, "0x8bf2dF0Ff8528088475183a68678bd1Cd7691b69");
      const manaTokenBalanceBnb = web3.utils.fromWei(helperMana, "ether");
      const manaTokenBalance = web3.utils.fromWei(manaTokenBalanceRes, "ether");

      const sandTokenBalanceRes = await this.state.NFTPortfolioContract.methods.sandBalance(this.state.account).call();
      const helperSand = await this.getExchangeRate(sandTokenBalanceRes, "0x1631A54AC95Ecb0085dB6b8ACf80c4Cee72AEB06");
      const sandTokenBalanceBnb = web3.utils.fromWei(helperSand, "ether");
      const sandTokenBalance = web3.utils.fromWei(sandTokenBalanceRes, "ether");

      const thetaTokenBalanceRes = await this.state.NFTPortfolioContract.methods.thetaBalance(this.state.account).call();
      const helperTheate = await this.getExchangeRate(thetaTokenBalanceRes, "0x19A5E53eC7B385dbE2E587Ba989eA2AB8F7EaF1e");
      const thetaTokenBalanceBnb = web3.utils.fromWei(helperTheate, "ether");
      const thetaTokenBalance = web3.utils.fromWei(thetaTokenBalanceRes, "ether");

      const flowTokenBalanceRes = await this.state.NFTPortfolioContract.methods.flowalance(this.state.account).call();
      const helperFlow = await this.getExchangeRate(flowTokenBalanceRes, "0xe5c48084E1974a971Bd5dF4d9B01daCCA86d5567");
      const flowTokenBalanceBnb = web3.utils.fromWei(helperFlow, "ether");
      const flowTokenBalance = web3.utils.fromWei(flowTokenBalanceRes, "ether");

      console.log(flowTokenBalanceRes);

      const xtzTokenBalanceRes = await this.state.NFTPortfolioContract.methods.xtzBalance(this.state.account).call();
      const helperXtz = await this.getExchangeRate(xtzTokenBalanceRes, "0xC5De9d5B0BA5b408a3e9530A1BC310d8F2dCC26a");
      const xtzTokenBalanceBnb = web3.utils.fromWei(helperXtz, "ether");
      const xtzTokenBalance = web3.utils.fromWei(xtzTokenBalanceRes, "ether");

      const galaTokenBalanceRes = await this.state.NFTPortfolioContract.methods.galaBalance(this.state.account).call();
      const helperGala = await this.getExchangeRate(galaTokenBalanceRes, "0x4bf1CE8E4c4c86126E57Fa9fc3f1a9631661641c");
      const galaTokenBalanceBnb = web3.utils.fromWei(helperGala, "ether");
      const galaTokenBalance = web3.utils.fromWei(galaTokenBalanceRes, "ether");

      const chzTokenBalanceRes = await this.state.NFTPortfolioContract.methods.chzBalance(this.state.account).call();
      const helperChz = await this.getExchangeRate(chzTokenBalanceRes, "0xdeEC6f0C22970b9b8a47069bE619bfAe646dEe26");
      const chzTokenBalanceBnb = web3.utils.fromWei(helperChz, "ether");
      const chzTokenBalance = web3.utils.fromWei(chzTokenBalanceRes, "ether");

      const enjTokenBalanceRes = await this.state.NFTPortfolioContract.methods.enjBalance(this.state.account).call();
      const helperEnj = await this.getExchangeRate(enjTokenBalanceRes, "0xb08A1959f57b9cC8e5A5F1d329EfD90EE3438F65");
      const enjTokenBalanceBnb = web3.utils.fromWei(helperEnj, "ether");
      const enjTokenBalance = web3.utils.fromWei(enjTokenBalanceRes, "ether");

      const roseTokenBalanceRes = await this.state.NFTPortfolioContract.methods.roseBalance(this.state.account).call();
      const helperRose = await this.getExchangeRate(roseTokenBalanceRes, "0x30c1AC77F4068A063648B549ffF96Ddb9d151325");
      const roseTokenBalanceBnb = web3.utils.fromWei(helperRose, "ether");
      const roseTokenBalance = web3.utils.fromWei(roseTokenBalanceRes, "ether");
      console.log("rose", roseTokenBalance);

      this.setState({
        nftTokenBalance,
        axsTokenBalance, manaTokenBalance, sandTokenBalance, thetaTokenBalance, flowTokenBalance,
        axsTokenBalanceBnb, manaTokenBalanceBnb, sandTokenBalanceBnb, thetaTokenBalanceBnb, flowTokenBalanceBnb,
        xtzTokenBalance, galaTokenBalance, chzTokenBalance, enjTokenBalance, roseTokenBalance,
        xtzTokenBalanceBnb, galaTokenBalanceBnb, chzTokenBalanceBnb, enjTokenBalanceBnb, roseTokenBalanceBnb
      });
  }

  getRate = async () => {
    const rateObj = await this.state.SwapContract.methods.currentRate().call();
    const rate = rateObj.numerator / rateObj.denominator;
    this.setState({ rate });
  }

  render() {
    let button;
    if (!this.state.connected) {
      button = <Button style={{ position: "absolute", top: "30px", right: "20px" }} onClick={this.connectWallet} color="orange">
          <Image style={{ "padding-top": "7px" }} floated="left" size="mini" src={metamask} />
          <p>Connect to MetaMask</p>
        </Button>
    } else {
      button = <p style={{ position: "absolute", top: "90px", right: "20px", color: "#C0C0C0" }}><b>Account:</b> {this.state.account}</p>
    }

    return (
      <div className="App">
        <br></br>

        <Image src={velvet} size="medium" verticalAlign='middle'></Image>

        {button}

        <Grid divided='vertically'>
          <Grid.Row columns={2} style={{ margin: "20px" }}>
            <Grid.Column>

              <Card.Group>
                <Card style={{ width: "900px" }}>
                  <Card.Content style={{ background: "#406ccd" }}>
                  <Card.Header style={{ color: "white" }}>
                    <p style={{ color: "#C0C0C0", "font-weight": "bold", "text-align": "right" }}>APY: XX%</p>
                      Top 10 Tokens
                      </Card.Header>
                    <Card.Description>

                      <p style={{ color: "#C0C0C0" }}>Rate: In return of investing 1 BNB you will receive 1 Top10 Token.</p>

                      <Form onSubmit={this.investDeFi}>
                        <Input style={{ width: "300px", padding: 3 }} required type="text" placeholder="BNB amount to create" name="defiToMint" onChange={this.handleInputChange}></Input>
                        <Button color="green" type="submit" style={{ margin: "20px", width: "150px" }}>Create</Button>
                      </Form>

                      <Form onSubmit={this.withdrawDeFi}>
                        <Input style={{ width: "300px", padding: 3 }} required type="text" placeholder="Top10 amount to redeem" name="withdrawValueDefi" onChange={this.handleInputChange}></Input>
                        <Button color="green" style={{ margin: "20px", width: "150px" }}>Redeem</Button>
                      </Form>

                      <Table style={{ "margin-left": "auto", "margin-right": "auto" }} basic='very' celled collapsing>
                        <Table.Header>
                          <Table.Row>
                            <Table.HeaderCell style={{ color: "white" }}>Token</Table.HeaderCell>
                            <Table.HeaderCell style={{ color: "white" }}>Balance</Table.HeaderCell>
                            <Table.HeaderCell style={{ color: "white" }}>Balance in BNB</Table.HeaderCell>
                          </Table.Row>
                        </Table.Header>

                        <Table.Body>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Top10 Token</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.defiTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.defiTokenBalance}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Bitcoin (BTC)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.btcTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.btcTokenBalanceBnb}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Ethereum (ETH)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.ethTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.ethTokenBalanceBnb}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Shiba Ibu (SHIB)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.shibaTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.shibaTokenBalanceBnb}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Ripple (XRP)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.xrpTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.xrpTokenBalanceBnb}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Litecoin (LTC)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.ltcTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.ltcTokenBalanceBnb}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Dai (DAI)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.daiTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.daiTokenBalanceBnb}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Terra (LUNA)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.lunaTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.lunaTokenBalanceBnb}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Chainlink (LINK)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.linkTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.linkTokenBalanceBnb}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Uniswap (UNI)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.uniTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.uniTokenBalanceBnb}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Lido Staked Ether (STETH)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.stethTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.stethTokenBalanceBnb}</Table.Cell>
                          </Table.Row>
                        </Table.Body>

                      </Table>

                    </Card.Description>
                  </Card.Content>
                </Card>
              </Card.Group>
            </Grid.Column>


            <Grid.Column>
              <Card.Group>
                <Card style={{ width: "900px" }}>
                  <Card.Content style={{ background: "#406ccd" }}>
                  <Card.Header style={{ color: "white" }}>
                      <p style={{ color: "#C0C0C0", "font-weight": "bold", "text-align": "right" }}>APY: YY%</p>
                      Top 10 Metaverse Tokens
                      </Card.Header>
                    <Card.Description>

                      <p style={{ color: "#C0C0C0" }}>Rate: In return of investing 1 BNB you will receive 1 META Token.</p>

                      <Form onSubmit={this.investNFT}>
                        <Input style={{ width: "300px", padding: 3 }} required type="text" placeholder="BNB amount to create" name="nftToMint" onChange={this.handleInputChange}></Input>
                        <Button color="green" type="submit" style={{ margin: "20px", width: "150px" }}>Create</Button>
                      </Form>

                      <Form onSubmit={this.withdrawNFT}>
                        <Input style={{ width: "300px", padding: 3 }} required type="text" placeholder="META amount to redeem" name="withdrawValueNFT" onChange={this.handleInputChange}></Input>
                        <Button color="green" style={{ margin: "20px", width: "150px" }}>Redeem</Button>
                      </Form>

                      <Table style={{ "margin-left": "auto", "margin-right": "auto" }} basic='very' celled collapsing>
                        <Table.Header>
                          <Table.Row>
                            <Table.HeaderCell style={{ color: "white" }}>Token</Table.HeaderCell>
                            <Table.HeaderCell style={{ color: "white" }}>Balance</Table.HeaderCell>
                            <Table.HeaderCell style={{ color: "white" }}>Balance in BNB</Table.HeaderCell>
                          </Table.Row>
                        </Table.Header>

                        <Table.Body>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Metaverse Token</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.nftTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.nftTokenBalance}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Axie Infinity (AXS)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.axsTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.axsTokenBalanceBnb}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Decentraland (MANA)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.manaTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.manaTokenBalanceBnb}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>The Sandbox (SAND)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.sandTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.sandTokenBalanceBnb}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Theta Network (THETA)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.thetaTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.thetaTokenBalanceBnb}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Flow (FLOW)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.flowTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.flowTokenBalanceBnb}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Tezos (XTZ)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.xtzTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.xtzTokenBalanceBnb}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Gala (GALA)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.galaTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.galaTokenBalanceBnb}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Chiliz (CHZ)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.chzTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.chzTokenBalanceBnb}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Enjin Coin (ENJ)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.enjTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.ethTokenBalanceBnb}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell style={{ color: "#C0C0C0" }}>Oasis Network (ROSE)</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.roseTokenBalance}</Table.Cell>
                            <Table.Cell style={{ color: "#C0C0C0" }}>{this.state.roseTokenBalanceBnb}</Table.Cell>
                          </Table.Row>

                        </Table.Body>
                      </Table>

                    </Card.Description>
                  </Card.Content>
                </Card>
              </Card.Group>

            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div >
    );
  }
}

export default App;
