module.exports = {
    contract_address: "0x494169b60577F8d840314d1D800E858d40FBB0C4",

    contract_abi: [
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_index_of_game",
                    "type": "uint256"
                },
                {
                    "internalType": "int8",
                    "name": "_lucky_number",
                    "type": "int8"
                }
            ],
            "name": "bid",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "int8",
                    "name": "_lucky_number",
                    "type": "int8"
                },
                {
                    "internalType": "uint256",
                    "name": "_max_amount_of_players",
                    "type": "uint256"
                }
            ],
            "name": "newGame",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "requestId",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256[]",
                    "name": "randomWords",
                    "type": "uint256[]"
                }
            ],
            "name": "rawFulfillRandomWords",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_index_of_game",
                    "type": "uint256"
                }
            ],
            "name": "transactToWinner",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "have",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "want",
                    "type": "address"
                }
            ],
            "name": "OnlyCoordinatorCanFulfill",
            "type": "error"
        },
        {
            "inputs": [],
            "name": "getAmountOfGames",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_index_of_game",
                    "type": "uint256"
                }
            ],
            "name": "getInfoAboutGame",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_index_of_game",
                    "type": "uint256"
                }
            ],
            "name": "getInfoAfterEnded",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_index_of_game",
                    "type": "uint256"
                }
            ],
            "name": "getIsNotClaimed",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_index_of_game",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "_index_of_player",
                    "type": "uint256"
                }
            ],
            "name": "getPlayersAddress",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_index_of_game",
                    "type": "uint256"
                }
            ],
            "name": "isEnded",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "one_game",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "max_amount_of_players",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "min_bid",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amount_of_players",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "overall_amount_of_bids",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amount_of_winners",
                    "type": "uint256"
                },
                {
                    "internalType": "bool",
                    "name": "is_ended",
                    "type": "bool"
                },
                {
                    "internalType": "uint256",
                    "name": "last_run",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amount_of_claimed",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_index_of_game",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "_index_of_player",
                    "type": "uint256"
                }
            ],
            "name": "revealWiners",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]
}
