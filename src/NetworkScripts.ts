import { timeout } from "rxjs/operators";
import { NetworkHttp, NetworkType, TransactionFees } from "symbol-sdk";

export type AppNetworkType = "TEST_NET" | "MAIN_NET";

export interface NetworkStructure {
  type: AppNetworkType;
  node: string;
  transactionFees: TransactionFees;
  generationHash?: string;
  currencyMosaicId?: string;
}

const TIME_OUT = 10000;

/** 値がundefinedならそのまま、そうでなければ渡された関数を処理する */
const undefinedPipe: <T, K>(v: T | undefined, f: (x: T) => K) => K | undefined = (v, f) => v === undefined ? undefined : f(v);

export default class NetworkScripts {

  /** ノードアドレスよりNetworkStructureを構成する */
  static async getNetworkStructureFromNode(node: string, networkType: NetworkType): Promise<NetworkStructure> {
    const networkHttp = new NetworkHttp(node);
    const { network, chain } = await networkHttp.getNetworkProperties().pipe(timeout(TIME_OUT)).toPromise();
    const transactionFees = await networkHttp.getTransactionFees().pipe(timeout(TIME_OUT)).toPromise().catch(_ => new TransactionFees(0, 0, 0, 0, 0));
    return {
      node, transactionFees,
      type: networkType === NetworkType.TEST_NET ? "TEST_NET" : "MAIN_NET",
      generationHash: network.generationHashSeed,
      currencyMosaicId: undefinedPipe(chain.currencyMosaicId, e => e.replace('0x', '').replace(/'/g, '')),
    }
  }
}