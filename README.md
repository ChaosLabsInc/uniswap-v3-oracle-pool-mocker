A simple package for configuring Uniswap V3 Oracle prices in a local hardhat mainnet fork testing environment.

## Prerequisites

In order to use the package correctly we'll want to run a mainnet fork. We need the fork so we can have a snapshot of all deployed Uniswap Pools and access to their Oracle interfaces. Uniswap v3 Oracles interface can be challenging to frok at first. That's why recommend reading the offical docs as well as checking out the [Chaos Labs blog](https://chaoslabs.xyz/blog). `Hardhat` has an Alchemy integration. In order to fork mainnet you need an API key, so navigate to the alchemy site and sign up for one.

- Alchemy API key for mainnet fork access: [Get one here](https://www.alchemy.com/).

## Installation
`npm i @chaos-labs/uniswap-v3-pool-mocker`

## Usage
this package expose the `UniSwapPoolMocker` object, imported from `@chaos-labs/uniswap-v3-pool-mocker`.
Example of usage - https://github.com/ChaosLabsInc/uniswap-v3-oracle-cli/blob/main/src/cli/index.ts.

**UniSwapPoolMocker(rpcUrl: string, poolAdress: string)**
the UniSwapPoolMocker Ctor recive the local hardhat rpc url (http://localhost:8545 for example) and the UniSwap V3 pool adress.

**Prices(twapInterval: number, dec0: number, dec1: number): Promise<number[]>**
Prices method recives the twap interval, and the pool's pair decimals. The return value will be the pair prices as calculated with the given interval.

**MockPrice(price: number, twapInterval: number, dec0: number, dec1: number): Promise**
MockPrice method recives the desired mocked price of the pool oracle, twap interval and the pool's pair decimals.

## Why is Mocking Oracle values useful in testing?

Oracle return values trigger internal state changes in web3 applications. When forking mainnent, TWAP oracles are static by default since no trades are executed in an isolated forked environment. If you're application consumes price data and initiates control flows based on these values, being able to test a range of prices is critical. However, manipulating prices to bring an application to a specific state requires an unreasoable amount of trades in pools. This is because TWAP oracle prices are determined by the pair ratio of liquidity in the pools at the time of the observations recorded. When we have a myriad of liquidity pools configuring prices can become a tedious process that involves a lot of custom scripting and hacks. Chaos Labs aims to streamline developer productivity while also making it easier to test applications. This tool gives developers the ability to mock return values easily. Now we can test how our contracts / applications react to different types of external data 🤗. Below, we provide some specific use cases for mocking oracle return values.

## Use Cases

DeFi protocols and applications are at high risk due to volatile market conditions and a myriad of security vectors. Mocking Uniswap V3 Oracle return values in a controlled, siloed testing environment allows us to address 2 common vectors.

**Volatile Market Conditions**

Volatility is a DeFi constant and is something that all protocols and applications should test for thoroughly. Internal application and protocol state is often a direct result of Oracle returns values. Because of this, controlling oracle return values in development is extremely powerful. To further illustrate this let's use an example.

Imagine a lending protocol (Maker, AAVE, Benqi, Spectral.finance, etc..) that accepts Ethereum as collateral against stablecoin loans. What happens on a day like Black Thursday, when Ethereum prices cascade negatively to the tune of ~70% in a 48 hour time frame? Well, a lot of things happen 🤦.

One critical aspect of responding to market volatiltiy is protocol keepers triggering liquidations and thus ensuring protocol solvency.

With the ability to control Oracle return values, simulating such scenarios in your local development environment is possible.

**Oracle Manipulation**

Oracle manipulation is an additional attack vector. With this method, malicious actors research data sources that various oracle consume as sources of truth. When actors possess the ability to manipulate the underlying data source they trigger downstream effects, manifesting in altered Oracle return values. As a result of manipulated data, actors and contracts can trigger various unwanted behaviours such as modified permissions, transaction execution, emergency pausing / shutdown and more.

With the ability to manipulate Uniswap V3 Oracle return values, simulating such scenarios in your local development environment is possible.
