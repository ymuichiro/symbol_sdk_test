import { NetworkType } from "symbol-sdk";
import AccountScripts from "../src/AccountScripts";
import NetworkScripts from "../src/NetworkScripts";
import { SAMPLE1, SAMPLE2 } from "../test_data";

(async () => {
  const nodeUrl = "http://symbol-test.next-web-technology.com:3000";
  const nw = await NetworkScripts.getNetworkStructureFromNode(nodeUrl, NetworkType.TEST_NET);
  // Accountの作成
  const account1 = AccountScripts.createRootAccountFromMnemonic(SAMPLE1.MNEMONIC, "password", nw);
  const account2 = AccountScripts.createRootAccountFromMnemonic(SAMPLE2.MNEMONIC, "password", nw);
  console.log(account1.address);
  console.log(account2.address);
  // Account情報の取得
  const [account1Info] = await AccountScripts.getBalanceFromAddress(account1.address, nw);
  const [account2Info] = await AccountScripts.getBalanceFromAddress(account2.address, nw);
  console.log(JSON.stringify(account1Info));
  console.log(JSON.stringify(account2Info));
})();