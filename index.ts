import { pipe } from "rxjs";
import { timeout } from "rxjs/operators";
import { Account, Address, ChainHttp, Deadline, Listener, Mosaic, MosaicId, NetworkCurrencies, NetworkHttp, NetworkType, RepositoryFactoryHttp, TransactionMapping, TransferTransaction, UInt64 } from "symbol-sdk";
import { TransactionURI } from "symbol-uri-scheme";
import AccountScripts from "./src/AccountScripts";
import MosaicScripts from "./src/MosaicScripts";
import NetworkScripts from "./src/NetworkScripts";
import TransactionScripts from "./src/TransactionScripts";
import { SAMPLE1 } from "./test_data";

/*
 基本の流れ
 - 受取用Txを発行する
 - 相手にQRでTx発行データを受け渡す（URI）
   - この際にModalで受取り状況監視を開始（キャンセルも可能）
   - Txを相手側で復元する
   - 支払う
   */


/** 受取用のTxを発行する */
(async () => {
  // const nodeUrl = "http://symbol-test.next-web-technology.com:3000";
  const nodeUrl = "http://ngl-dual-101.testnet.symboldev.network:3000";
  const nw = await NetworkScripts.getNetworkStructureFromNode(nodeUrl, NetworkType.TEST_NET);
  // const account1 = AccountScripts.createRootAccountFromMnemonic(SAMPLE1.MNEMONIC, "password", nw);
  const account = AccountScripts.createRootAccountFromMnemonic(SAMPLE1.MNEMONIC, "password", nw);
  const mosaics = await AccountScripts.getBalanceFromAddress(account.address, nw);
  const mosaic = await MosaicScripts.getMosaicStructureFromMosaicId(mosaics[0].mosaicId, nw);

  const tx = (await TransactionScripts.createTransaction(
    account.address,
    [{ mosaic: mosaic, amount: 1 }],
    "tset",
    nw,
  )).serialize();

  const uri = new TransactionURI(tx, TransactionMapping.createFromPayload, nw.generationHash, nw.node);
  console.log(uri.build());

});

//　トランザクションURIをQRコードに変換する
(async () => {
  const u = "web+symbol://transaction?data=B500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000198544180841E00000000003FDECBB40400000098FCE18C2FDA2116387768741C82BA5B70E4363177B9448B05000100000000003CE19A057E831F0940420F00000000000074736574&generationHash=3B5E1FA6445653C971A50687E75E6D09FB30481055E3990C84B25E9222DC1155&nodeUrl=http://ngl-dual-101.testnet.symboldev.network:3000";
  const uri = TransactionURI.fromURI(u, TransactionMapping.createFromPayload)
  const tx = uri.toTransaction();
  console.log(tx.toJSON().transaction.mosaics);
});

// 自身宛の着金をウォッチする →　監視中の相手の情報を最後にUI側へ表示すればOK
(async () => {

  const nodeUrl = "http://symbol-test.next-web-technology.com:3000";
  const nw = await NetworkScripts.getNetworkStructureFromNode(nodeUrl, NetworkType.TEST_NET);
  const account = AccountScripts.createRootAccountFromMnemonic(SAMPLE1.MNEMONIC, "password", nw);
  const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
  const listerner = repositoryFactory.createListener();
  listerner.open().then(() => {
    listerner.newBlock(); // セッションアウト防止用
    listerner
      .confirmed(Address.createFromRawAddress(account.address))
      .subscribe(tx => {
        console.log("受信", tx);
      })
  });

});

// 定期的に自分宛の新着入金を取得する（バックグラウンドプロセス向け）
// 自分宛の入金を直近n件取得し、その中身が異なる場合通知する
(async () => {
  const nodeUrl = "http://symbol-test.next-web-technology.com:3000";
  const nw = await NetworkScripts.getNetworkStructureFromNode(nodeUrl, NetworkType.TEST_NET);
  const account = AccountScripts.createRootAccountFromMnemonic(SAMPLE1.MNEMONIC, "password", nw);




});

// 定期的にレスポンスを返し、一定時間後に止める事は可能か
const epoch = (f: Function) => {
  setInterval(() => {
    console.log("epoch");
    f("ping");
  }, 1000)
}

(async () => {
  const f = (v: any) => {
    console.log(v)
  };
  const a = epoch(f);
  console.log(a);
})();


export { };