import { Point } from "@tkey/common-types";
import BN from "bn.js";
declare function getTSSPubKey(dkgPubKey: Point, userShare: BN, userTSSIndex: number): any;
declare function getLagrangeCoeffs(_allIndexes: number[] | BN[], _myIndex: number | BN, _target?: number | BN): BN;
declare const CalcultationHelper: {
    getTSSPubKey: typeof getTSSPubKey;
    getLagrangeCoeffs: typeof getLagrangeCoeffs;
};
export default CalcultationHelper;
