// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const VidVerseModule = buildModule("VidVerseModule", (m) => {
  const zoraFactoryAddress = "0x777777751622c0d3258f214F9DF38E35BF45baF3";
  const vidVerse = m.contract("VidVerse", [zoraFactoryAddress], {});
  return { vidVerse };
});

export default VidVerseModule;
