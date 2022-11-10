import { UniSwapPoolMocker } from "./index";
import { Pool } from "../config/types";
import { BigNumber } from "ethers";

const Pools: Array<Pool> = require("../config/config.json");
const rpcURL = "http://localhost:8545";

jest.setTimeout(60 * 1000);

test(`mocker base`, async () => {
  const pool = Pools[0];
  const mocker = new UniSwapPoolMocker(rpcURL, pool.address);
  const poolContract = mocker.getPoolContract();

  try {
    await poolContract.observations([0]);
  } catch (e) {
    throw new Error("Cannot connect to local fork on 8545. This test requires a lock fork running.");
  }

  //slot0 tick:
  await mocker.OverrideSlot0Tick(1);
  const slot0 = await mocker.Slot0();
  expect(slot0.tick).toEqual(1);

  //observation tick:
  await mocker.OverrideObservationTick(BigNumber.from(2), 0);
  let observation0 = await poolContract.observations([0]);
  const tick0 = (observation0.tickCumulative as BigNumber).toString();
  expect(tick0).toEqual("2");

  //observation timestamp:
  await mocker.OverrideObservationTimestamp(3, 0);
  observation0 = await poolContract.observations([0]);
  expect(observation0.blockTimestamp).toEqual(3);

  //mock price:
  const twapInterval = 100;
  const price = 4;
  let upperBoundPrice = price * 1.01 + 0.1;
  let lowerBoundPrice = price * 0.99 - 0.1;
  await mocker.MockPrice(price, twapInterval, pool.decimals.token0, pool.decimals.token1);
  const prices = await mocker.Prices(twapInterval, pool.decimals.token0, pool.decimals.token1);
  expect(prices[1]).toBeGreaterThan(lowerBoundPrice);
  expect(prices[1]).toBeLessThan(upperBoundPrice);
  expect(prices[0]).toBeGreaterThan(1 / upperBoundPrice);
  expect(prices[0]).toBeLessThan(1 / lowerBoundPrice);
});

test(`mocker concurrent changes`, async () => {
  const pool = Pools[1];
  const mocker = new UniSwapPoolMocker(rpcURL, pool.address);
  const poolContract = mocker.getPoolContract();

  try {
    await poolContract.observations([0]);
  } catch (e) {
    throw new Error("Cannot connect to local fork on 8545. This test requires a lock fork running.");
  }

  const twapInterval = 200;
  let price = 1055;
  let upperBoundPrice = price * 1.01 + 0.1;
  let lowerBoundPrice = price * 0.99 - 0.1;
  await mocker.MockPrice(price, twapInterval, pool.decimals.token0, pool.decimals.token1);
  let prices = await mocker.Prices(twapInterval, pool.decimals.token0, pool.decimals.token1);
  expect(prices[1]).toBeGreaterThan(lowerBoundPrice);
  expect(prices[1]).toBeLessThan(upperBoundPrice);
  expect(prices[0]).toBeGreaterThan(1 / upperBoundPrice);
  expect(prices[0]).toBeLessThan(1 / lowerBoundPrice);

  price = 0.005;
  upperBoundPrice = price * 1.01 + 0.1;
  lowerBoundPrice = price * 0.99 - 0.1;
  await mocker.MockPrice(price, twapInterval, pool.decimals.token0, pool.decimals.token1);
  prices = await mocker.Prices(twapInterval, pool.decimals.token0, pool.decimals.token1);
  expect(prices[1]).toBeGreaterThan(lowerBoundPrice);
  expect(prices[1]).toBeLessThan(upperBoundPrice);
});
