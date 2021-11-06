import { timeout } from "rxjs/operators";
import { Mosaic, MosaicHttp, MosaicId, MosaicInfo, NamespaceHttp, RepositoryFactoryHttp } from "symbol-sdk";
import { NetworkStructure } from "./NetworkScripts";

export interface MosaicStructure {
  mosaicId: string;
  mosaicName: string;
  divisibility: number;
}

const TIME_OUT = 5000;

export default class MosaicScripts {

  static async getMosaicStructureFromMosaicId(mosaicIDHex: string, network: NetworkStructure): Promise<MosaicStructure> {
    const mosaicId = new MosaicId(mosaicIDHex);
    const repositry = new RepositoryFactoryHttp(network.node);
    const mosaicHttp = repositry.createMosaicRepository();
    const info = await mosaicHttp.getMosaic(mosaicId).pipe(timeout(TIME_OUT)).toPromise();
    const [mosaicName] = await new NamespaceHttp(network.node).getMosaicsNames([mosaicId]).toPromise();
    return {
      mosaicId: info.id.toHex(),
      mosaicName: mosaicName && mosaicName.names && mosaicName.names.length > 0 ? mosaicName.names[0].name : info.id.toHex(),
      divisibility: info.divisibility,
    };
  }
}