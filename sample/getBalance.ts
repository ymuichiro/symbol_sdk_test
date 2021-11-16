import { NetworkType } from "symbol-sdk";
import AccountScripts from "../src/AccountScripts";
import MosaicScripts from "../src/MosaicScripts";
import NetworkScripts from "../src/NetworkScripts";
import TransactionScripts from "../src/TransactionScripts";
import { SAMPLE1, SAMPLE2 } from "../test_data";

// 過去作成したニーモニックよりアカウントを復元し、保有モザイクを確認する
(async () => {
  const nodeUrl = "http://symbol-test.next-web-technology.com:3000";
  const nw = await NetworkScripts.getNetworkStructureFromNode(nodeUrl, NetworkType.TEST_NET);
  // Accountの作成
  const account1 = AccountScripts.createRootAccountFromMnemonic(SAMPLE1.MNEMONIC, "password", nw);
  const account2 = AccountScripts.createRootAccountFromMnemonic(SAMPLE2.MNEMONIC, "password", nw);
  console.log(account1.address);
  console.log(account2.address);
  // Account情報の取得
  const [accountInfo] = await AccountScripts.getBalanceFromAddress(account2.address, nw);
  console.log(JSON.stringify(accountInfo));
  // ACCOUNT2 -> 1への送金
  const mosaic = await MosaicScripts.getMosaicStructureFromMosaicId(accountInfo.mosaicId, nw);
  const tx = await TransactionScripts.createTransaction(account1.address, [{ mosaic, amount: 1 }], "test", nw);
  console.log(tx.transactionInfo?.id);
  const result = await TransactionScripts.signTransaction(account2, tx, nw);
  console.log(result);
})();