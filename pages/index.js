import Head from "next/head";
import Image from "next/image";
import "../styles/Home.module.css";
import { ethers } from "ethers";
import React, { useEffect, useState, StrictMode } from "react";
import Web3 from 'web3';
import { contract_abi, contract_address } from "./lottery";
import { Button, Header, Icon, Modal } from 'semantic-ui-react'

const GetDate = (seconds) => {
  const date = new Date(seconds * 1000);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${day.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${date.getFullYear()} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

const CountDown = ({ minutes = 0, seconds = 0 }) => {
  const [over, setOver] = React.useState(false);
  const [[m, s], setTime] = React.useState([minutes, seconds]);

  const tick = () => {
    if (m === 0 && s === 0) {
      setOver(true);
    } else if (s == 0) {
      setTime([m - 1, 59]);
    } else {
      setTime([m, s - 1]);
    }
  };

  React.useEffect(() => {
    const EventEmitter = require('events');
    const emitter = new EventEmitter()
    emitter.setMaxListeners(0)
    const timerID = setInterval(() => tick(), 1000);
    return () => clearInterval(timerID);
  });

  return (
    <label>
      {over ? "Time's up!" : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`}
    </label>
  );
};

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showGame: false,
      showModal: false,
      showTransactModal: false,
      showResultModal: false,
      resultModalWasNotShown: this.props.was_not_ended,
      showModalJoined: false,
      m_before_start: 5,
      s_before_start: 0,
      max_amount_of_players: '',
      lucky_number: '',
      index_of_this_game: this.props.index_of_this_game,
      actual_amount_of_people: '',
      bid: '',
      is_ended: false,
      is_winner: false,
      is_not_claimed: false,
      winners: '',
      losers: '',
      prize_pool: '',
      prize_pool_for_each: '',
      time: '',
      players_addresses: [],
      winners_addresses: []
    }
  }

  async componentDidMount() {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const signer = await provider.getSigner().getAddress();
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(contract_abi, contract_address);
    const mas = await contract.methods.getInfoAboutGame(this.state.index_of_this_game).call({ from: signer })
    const max_amount_of_players = mas[0];
    const bid = web3.utils.fromWei(mas[1], "finney");
    const actual_amount_of_people = mas[2];
    const time_before_start = 300 - (mas[4] - mas[3]);
    const m_before_start = Math.floor(time_before_start / 60);
    const s_before_start = time_before_start % 60;
    let nextState = [];
    for (let i = 0; i < actual_amount_of_people; i++) {
      let player = await contract.methods.getPlayersAddress(this.state.index_of_this_game, i).call({ from: signer });
      nextState = [...nextState, player]
    }
    this.setState({ max_amount_of_players: max_amount_of_players, bid: bid, actual_amount_of_people: actual_amount_of_people, showGame: true, m_before_start: m_before_start, s_before_start: s_before_start, players_addresses: nextState });
    setTimeout(this.revealWiners, time_before_start * 1000)
  }

  bid = async () => {
    this.setState({ showModal: false });
    this.setState({ showTransactModal: true });
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const signer = await provider.getSigner().getAddress();
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(contract_abi, contract_address);
    const { lucky_number, index_of_this_game, bid, players_addresses } = this.state;
    if (players_addresses.indexOf(signer) == -1) {
      await contract.methods.bid(index_of_this_game, lucky_number).send({ from: signer, value: web3.utils.toWei(bid, "finney") });
      const am_of_pl = this.state.actual_amount_of_people + 1;
      this.setState({ actual_amount_of_people: am_of_pl });
    } else {
      this.setState({ showModalJoined: true });
    }
    this.setState({ showTransactModal: false, lucky_number: "" });
  }

  isWiner = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const signer = await provider.getSigner().getAddress();
    const { winners_addresses } = this.state;
    if (winners_addresses.indexOf(signer) != -1) {
      this.setState({ is_winner: true })
    }
  }

  revealWiners = async () => {
    const { actual_amount_of_people, players_addresses } = this.state;
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const signer = await provider.getSigner().getAddress();
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(contract_abi, contract_address);
    const { index_of_this_game } = this.state;
    const mas = await contract.methods.getInfoAfterEnded(index_of_this_game).call({ from: signer });
    const winners = mas[0];
    const losers = actual_amount_of_people - winners
    const prize_pool = web3.utils.fromWei(mas[1], "finney");
    const time = mas[2];
    let nextState = [];
    for (let i = 0; i < actual_amount_of_people; i++) {
      let is_winner = await contract.methods.revealWiners(index_of_this_game, i).call({ from: signer });
      if (is_winner) {
        nextState = [...nextState, players_addresses[i]]
      }
    }
    this.setState({ is_ended: true, winners: winners, prize_pool: prize_pool, losers: losers, time: time, prize_pool_for_each: prize_pool / winners, showResultModal: true, winners_addresses: nextState });
  }

  claim = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const signer = await provider.getSigner().getAddress();
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(contract_abi, contract_address);
    const { index_of_this_game } = this.state
    await contract.methods.transactToWinner(index_of_this_game).send({ from: signer });
  }

  isNotClaimed = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const signer = await provider.getSigner().getAddress();
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(contract_abi, contract_address);
    const { index_of_this_game } = this.state;
    if (await contract.methods.getIsNotClaimed(index_of_this_game).call({ from: signer })) {
      this.setState({ is_not_claimed: true })
    }
  }

  onChangeLuckyNumber = (e) => this.setState({ lucky_number: e.target.value })

  handleModalOpen = () => this.setState({ showModal: true })

  handleModalClose = () => this.setState({ showModal: false })

  handleTransactModalClose = () => this.setState({ showTransactModal: false })

  handleResultModalClose = () => this.setState({ showResultModal: false, resultModalWasNotShown: false })

  handleJoinedModalClose = () => this.setState({ showModalJoined: false })

  render() {
    const { actual_amount_of_people, max_amount_of_players, bid, lucky_number, winners, losers, prize_pool, time, prize_pool_for_each } = this.state;
    const date = GetDate(time);
    this.isWiner();
    this.isNotClaimed();
    return (
      <div>
        <Modal
          open={this.state.showResultModal && this.state.resultModalWasNotShown}
          onClose={this.handleResultModalClose}
          basic
          size='small'
        >
          <Header icon='browser' content='Game over' />
          <Modal.Content>
            <div>
              <div>{this.isWiner ? "You win!" : "You lose!"}</div>
              {this.isWiner ? <div>You won {prize_pool_for_each} Finneys</div> : ""}
            </div>
          </Modal.Content>
          <Modal.Actions>
            {this.isWiner ? <Button color="green" onClick={this.claim}>Claim!</Button> : ""}
            <Button color='green' onClick={this.handleResultModalClose} inverted>
              <Icon name='checkmark' /> Got it
            </Button>
          </Modal.Actions>
        </Modal>
        <div>Bid: {this.state.showGame ? bid : ""}</div>
        {this.state.is_ended ?
          <div>Datetime: {date}</div> :
          <div>Before the start: {this.state.showGame ? <CountDown minutes={this.state.m_before_start} seconds={this.state.s_before_start} /> : ""}</div>
        }
        {this.state.is_ended ?
          <div>Total: {actual_amount_of_people}, Winners: {winners},  Losers: {losers}</div> :
          <div>Number of players: {this.state.showGame ? `${actual_amount_of_people} / ${max_amount_of_players}` : ""}</div>
        }
        {this.state.is_ended ?
          <div>Prize pool: {prize_pool}</div> :
          <div>
            <label>Guess a number: </label>
            {this.state.showGame ? <input type="number" min="0" max="100" value={lucky_number} onChange={this.onChangeLuckyNumber} /> : ""}
          </div>
        }
        {this.state.is_ended ? this.state.is_winner ? this.state.is_not_claimed ? <div><button onClick={this.claim}>Claim!</button></div> : "" : "" : this.state.showGame ?
          <div>
            <Modal
              trigger={<Button onClick={this.handleModalOpen}>Bid</Button>}
              open={this.state.showModal}
              onClose={this.handleModalClose}
              basic
              size='small'
            >
              <Header icon='browser' content='Bid' />
              <Modal.Content>
                <h3>Your bid {bid} Finney. Would you like to proceed?</h3>
              </Modal.Content>
              <Modal.Actions>
                <Button color='green' onClick={this.handleModalClose} inverted>No</Button>
                <Button color="green" onClick={this.bid}>Yes</Button>
              </Modal.Actions>
            </Modal>
            <Modal
              open={this.state.showTransactModal}
              onClose={this.handleTransactModalClose}
              basic
              size='small'
            >
              <Header icon='browser' content='Bid information' />
              <Modal.Content>
                <h3>Confirm the transaction in your wallet...</h3>
              </Modal.Content>
              <Modal.Actions>
              </Modal.Actions>
            </Modal>
            <Modal
              open={this.state.showModalJoined}
              onClose={this.handleJoinedModalClose}
              basic
              size='small'
            >
              <Header icon='browser' content='Alert!' />
              <Modal.Content>
                <h3>You have already joined this game</h3>
              </Modal.Content>
              <Modal.Actions>
                <Button color='green' onClick={this.handleJoinedModalClose} inverted>
                  <Icon name='checkmark' /> Got it
                </Button>
              </Modal.Actions>
            </Modal>
          </div> : <div><button disabled>Waiting...</button></div>}
      </div>
    );
  }
}

class NewGame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      showTransactModal: false,
      showMetamaskModal: false,
      index_of_this_game: 0,
      lucky_number: '',
      bid: '',
      max_amount_of_players: '',
      games: []
    }
  }

  async componentDidMount() {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const signer = await provider.getSigner().getAddress();
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(contract_abi, contract_address);
    const amount_of_games = await contract.methods.getAmountOfGames().call({ from: signer });
    let nextState = []
    for (let i = 0; i < amount_of_games; i++) {
      const is_ended = await contract.methods.isEnded(i).call({ from: signer });
      if (!is_ended) {
        nextState = [...nextState, { index_of_this_game: i }];
      }
    }
    this.setState({ games: nextState, index_of_this_game: amount_of_games });
  }

  newGame = async () => {
    if (typeof window.ethereum !== "undefined") {
      this.setState({ showModal: false });
      this.setState({ showTransactModal: true });
      const { index_of_this_game, lucky_number, bid, max_amount_of_players, games } = this.state;
      const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      const signer = await provider.getSigner().getAddress();
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(contract_abi, contract_address);
      try {
        await contract.methods.newGame(lucky_number, max_amount_of_players).send({ from: signer, value: web3.utils.toWei(bid, "finney") });
        const nextState = [...games, { index_of_this_game: index_of_this_game }];
        this.setState({ showTransactModal: false, createNewGame: false, games: nextState, lucky_number: '', bid: '', max_amount_of_players: '', index_of_this_game: this.state.index_of_this_game + 1 });
      } catch (e) {
        this.setState({ showTransactModal: false })
      }
    } else {
      this.setState({ showMetamaskModal: true })
    }
  }

  onChangeBid = (e) => this.setState({ bid: e.target.value })

  onChangeLuckyNumber = (e) => this.setState({ lucky_number: e.target.value })

  onChangeMaxAmount = (e) => this.setState({ max_amount_of_players: e.target.value })

  handleModalOpen = () => this.setState({ showModal: true })

  handleModalClose = () => this.setState({ showModal: false })

  handleTransactModalClose = () => this.setState({ showTransactModal: false })

  handleMetamaskModalClose = () => this.setState({ showMetamaskModal: false })

  onClose = () => this.isModal = false;

  render() {
    const { index_of_this_game, lucky_number, bid, max_amount_of_players, games } = this.state;
    return (
      <div>
        <div>
          <h1 className="header">Start new game(for testnet Rinkeby)</h1>
          <div>
            <div>
              <label>Guess a number: </label>
              <input type="number" min="0" max="100" value={lucky_number} onChange={this.onChangeLuckyNumber} />
            </div>
            <div>
              <label>Your bid: </label>
              <input type="number" value={bid} onChange={this.onChangeBid} />
              <label>Finney</label>
            </div>
            <div>
              <label>Limit of players</label>
              <input type="number" min="1" value={max_amount_of_players} onChange={this.onChangeMaxAmount} />
            </div>
          </div>
          <div>
            <Modal
              trigger={<Button onClick={this.handleModalOpen}>CreateNewGame</Button>}
              open={this.state.showModal}
              onClose={this.handleModalClose}
              basic
              size='small'
            >
              <Header icon='browser' content='New game' />
              <Modal.Content>
                <h3>Your bid {bid} Finney. Would you like to proceed?</h3>
              </Modal.Content>
              <Modal.Actions>
                <Button color='green' onClick={this.handleModalClose} inverted>No</Button>
                <Button color="green" onClick={this.newGame}>Yes</Button>
              </Modal.Actions>
            </Modal>
            <Modal
              open={this.state.showTransactModal}
              onClose={this.handleTransactModalClose}
              basic
              size='small'
            >
              <Header icon='browser' content='Bid information' />
              <Modal.Content>
                <h3>Confirm the transaction in your wallet...</h3>
              </Modal.Content>
              <Modal.Actions>
              </Modal.Actions>
            </Modal>
            <Modal
              open={this.state.showMetamaskModal}
              onClose={this.handleMetamaskModalClose}
              basic
              size='small'
            >
              <Header icon='browser' content='Alert!' />
              <Modal.Content>
                <h3>Please, connect your wallet</h3>
              </Modal.Content>
              <Modal.Actions>
                <Button color='green' onClick={this.handleMetamaskModalClose} inverted>
                  <Icon name='checkmark' /> Ok
                </Button>
              </Modal.Actions>
            </Modal>
          </div>
        </div>
        <ul>
          {
            games.map((item, i) => {
              return (
                <li key={i}>
                  <Game index_of_this_game={item.index_of_this_game} was_not_ended={true} />
                </li>
              )
            })
          }
        </ul>
      </div>
    )
  }
}

class PastGames extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index_of_this_game: "",
      games: []
    }
  }

  async componentDidMount() {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const signer = await provider.getSigner().getAddress();
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(contract_abi, contract_address);
    const amount_of_games = await contract.methods.getAmountOfGames().call({ from: signer })
    let nextState = [];
    for (let i = 0; i < amount_of_games; i++) {
      const is_ended = await contract.methods.isEnded(i).call({ from: signer });
      if (is_ended) {
        nextState = [{ index_of_this_game: i }, ...nextState];
      }
    }
    this.setState({ games: nextState })
  }

  render() {
    const { games } = this.state;
    return (
      <div>
        <h1>Past games</h1>
        <div>
          <ul>
            {
              games.map((item, i) => {
                return (
                  <li key={i}>
                    <Game index_of_this_game={item.index_of_this_game} was_not_ended={false} />
                  </li>
                )
              })
            }
          </ul>
        </div>
      </div>
    )
  }
}

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [hasWindow, setHasWindow] = useState(false);
  const [currentGames, setCurrentGames] = useState(true);
  const [pastGames, setPastGames] = useState(false);

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setHasWindow(true);
    }
  });

  async function connect() {
    if (typeof window.ethereum !== "undefined") {
      try {
        await ethereum.request({ method: "eth_requestAccounts" });
        setIsConnected(true);
      } catch (e) {
        console.log(e);
      }
    } else {
      setIsConnected(false);
    }
  }

  const handleCurrentGames = () => {
    setPastGames(false);
    setCurrentGames(true);
  }

  const handlePastGames = () => {
    setCurrentGames(false);
    setPastGames(true);
  }

  return (
    <div>
      {hasWindow ? (
        isConnected ? (
          "Connected! "
        ) : (
          <button onClick={() => connect()}>Connect</button>
        )
      ) : (
        "Please install metamask"
      )}
      {hasWindow ? isConnected ?
        <div>
          <div>
            <button onClick={handleCurrentGames}>Current games</button>
            <button onClick={handlePastGames}>Past games</button>
          </div>
          {currentGames ? hasWindow ? <NewGame /> : "" : ""}
          {pastGames ? hasWindow ? <PastGames /> : "" : ""} \
        </div> : "" : ""}
    </div>
  );
}