import { Account, Address, Deadline, Mosaic, MosaicId, PlainMessage, RepositoryFactoryHttp, TransactionAnnounceResponse, TransferTransaction, UInt64 } from "symbol-sdk";
import { AccountStructure } from "./AccountScripts";
import { MosaicStructure } from "./MosaicScripts";
import NetworkScripts, { NetworkStructure } from "./NetworkScripts";

interface MosaicTxStructure {
  mosaic: MosaicStructure;
  amount: number;
}

export default class TransactionScripts {

  /** Mosaicを送信するTransactionの生成(メッセージ平文) */
  static async createTransaction(reciptAddress: string, mosaic: MosaicTxStructure[], msgs: string, nw: NetworkStructure): Promise<TransferTransaction> {
    return TransferTransaction.create(
      Deadline.create(nw.epochAdjustment),
      Address.createFromRawAddress(reciptAddress),
      mosaic.map(m => new Mosaic(new MosaicId(m.mosaic.mosaicId), UInt64.fromUint(m.amount * Math.pow(10, m.mosaic.divisibility)))),
      PlainMessage.create(msgs),
      NetworkScripts.getEnumNwType(nw.type),
      UInt64.fromUint(2000000),
    )
  }

  /** Transacitonへの署名による確定 */
  static async signTransaction(signer: AccountStructure, tx: TransferTransaction, nw: NetworkStructure): Promise<TransactionAnnounceResponse> {
    const signerAccount = Account.createFromPrivateKey(signer.privateKey, NetworkScripts.getEnumNwType(nw.type));
    const signedTransaction = signerAccount.sign(tx, nw.generationHash);
    const repoFactory = new RepositoryFactoryHttp(nw.node);
    const txRepo = repoFactory.createTransactionRepository();
    return await txRepo.announce(signedTransaction).toPromise();
  }



}