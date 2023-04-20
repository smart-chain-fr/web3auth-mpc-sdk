import { Point } from "@tkey/common-types";
import BN from "bn.js";
declare function getTSSPubKey(dkgPubKey: Point, userShare: BN, userTSSIndex: number): any;
declare function getLagrangeCoeffs(_allIndexes: number[] | BN[], _myIndex: number | BN, _target?: number | BN): BN;
export declare const getAdditiveCoeff: (isUser: boolean, participatingServerIndexes: number[], userTSSIndex: number, serverIndex?: number) => BN;
export declare const getDenormaliseCoeff: (party: number, parties: number[]) => BN;
declare function getDKLSCoeff(isUser: boolean, participatingServerIndexes: number[], userTSSIndex: number, serverIndex?: number): BN;
declare const CalcultationHelper: {
    getTSSPubKey: typeof getTSSPubKey;
    getLagrangeCoeffs: typeof getLagrangeCoeffs;
    getDKLSCoeff: typeof getDKLSCoeff;
};
export default CalcultationHelper;
