import { NetworkType } from "symbol-sdk";
import AccountScripts from "../src/AccountScripts";
import MosaicScripts from "../src/MosaicScripts";
import NetworkScripts from "../src/NetworkScripts";
import TransactionScripts from "../src/TransactionScripts";
import { SAMPLE1, SAMPLE2 } from "../test_data";

// ニーモニックに子アカウントの作成
(async () => {
  const nodeUrl = "http://symbol-test.next-web-technology.com:3000";
  const nw = await NetworkScripts.getNetworkStructureFromNode(nodeUrl, NetworkType.TEST_NET);
  const account1 = AccountScripts.createAccountFromMnemonicAndIndex(SAMPLE1.MNEMONIC, "password", 1, nw);
  const account2 = AccountScripts.createRootAccountFromMnemonic(SAMPLE2.MNEMONIC, "password", nw);
  console.log(account1.address);
  const [account2Mosaic] = await AccountScripts.getBalanceFromAddress(account2.address, nw);
  const mosaic = await MosaicScripts.getMosaicStructureFromMosaicId(account2Mosaic.mosaicId, nw);
  const tx = await TransactionScripts.createTransaction(account1.address, [{ mosaic, amount: 1 }], "test", nw);
  const result = await TransactionScripts.signTransaction(account2, tx, nw); // 署名済みTransactionのアナウンス  console.log(result);
  const [account1Mosaic] = await AccountScripts.getBalanceFromAddress(account1.address, nw);
  console.log(account1Mosaic);
})();