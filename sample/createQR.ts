import { NetworkType } from "symbol-sdk";
import AccountScripts from "../src/AccountScripts";
import NetworkScripts from "../src/NetworkScripts";
import { SAMPLE1 } from "../test_data";

// QRコードの出力
(async () => {
  const nodeUrl = "http://symbol-test.next-web-technology.com:3000";
  const nw = await NetworkScripts.getNetworkStructureFromNode(nodeUrl, NetworkType.TEST_NET);
  const account1 = AccountScripts.createRootAccountFromMnemonic(SAMPLE1.MNEMONIC, "password", nw);
  const qr = await AccountScripts.getAddressQRFromRowAddress("Symbol", account1.address, nw);
  console.log(qr);
})();