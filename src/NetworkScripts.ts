import { timeout } from "rxjs/operators";
import { NetworkHttp, NetworkType, TransactionFees } from "symbol-sdk";

export type AppNetworkType = "TEST_NET" | "MAIN_NET";

export interface NetworkStructure {
  type: AppNetworkType;
  node: string;
  transactionFees: TransactionFees;
  // ネメシスブロックのHash算出 都度呼び出す必要は無し
  generationHash: string;
  // Transaction deadline向け値 都度呼び出す必要は無し
  epochAdjustment: number;
  // 動的手数料の制御
  defaultDynamicFeeMultiplier: number;
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
      type: this.getStrNwType(networkType),
      generationHash: network.generationHashSeed!,
      currencyMosaicId: undefinedPipe(chain.currencyMosaicId, e => e.replace('0x', '').replace(/'/g, '')),
      epochAdjustment: network.epochAdjustment === undefined ? 0 : parseInt(network.epochAdjustment),
      defaultDynamicFeeMultiplier: undefinedPipe(chain.defaultDynamicFeeMultiplier, x => Number(x)) || 1000,
    }
  }

  /** 文字列型NetworktypeをEnum型に変換する */
  static getStrNwType(networkType: NetworkType): AppNetworkType {
    if (networkType === NetworkType.MAIN_NET) {
      return "MAIN_NET";
    } else {
      return "TEST_NET";
    }
  }

  /** 文字列型NetworktypeをEnum型に変換する */
  static getEnumNwType(networkType: AppNetworkType): NetworkType {
    switch (networkType) {
      case "MAIN_NET":
        return NetworkType.MAIN_NET;
      case "TEST_NET":
        return NetworkType.TEST_NET;
      default:
        return NetworkType.TEST_NET;
    }
  }
}