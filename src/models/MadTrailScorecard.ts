/*****************************/
/*     MadTrailScorecard     */
/*****************************/
// the user's scorecard for the mad trail leaderboard

export class MadTrailScorecard {
    address: string;

    hasLong: boolean;
    hasShort: boolean;

    hasSol: boolean;
    hasBtc: boolean;
    hasEth: boolean;
    hasApt: boolean;
    hasArb: boolean;

    numVolume10: number;
    numVolume50: number;
    numVolume100: number;
    numVolume500: number;
    numVolume1000: number;

    numProfit1: number;
    numProfit5: number;
    numProfit10: number;
    numProfit50: number;
    numProfit100: number;

    volume: number;

	constructor(
        address: string = ''
        , hasLong: boolean = false
        , hasShort: boolean = false

        , hasSol: boolean = false
        , hasBtc: boolean = false
        , hasEth: boolean = false
        , hasApt: boolean = false
        , hasArb: boolean = false

        , numVolume10: number = 0
        , numVolume50: number = 0
        , numVolume100: number = 0
        , numVolume500: number = 0
        , numVolume1000: number = 0

        , numProfit1: number = 0
        , numProfit5: number = 0
        , numProfit10: number = 0
        , numProfit50: number = 0
        , numProfit100: number = 0
        , volume: number = 0

    ) {
        this.address = address;
        this.hasLong = hasLong;
        this.hasShort = hasShort;
        this.hasSol = hasSol;
        this.hasBtc = hasBtc;
        this.hasEth = hasEth;
        this.hasApt = hasApt;
        this.hasArb = hasArb;

        this.numVolume10 = numVolume10;
        this.numVolume50 = numVolume50;
        this.numVolume100 = numVolume100;
        this.numVolume500 = numVolume500;
        this.numVolume1000 = numVolume1000;

        this.numProfit1 = numProfit1;
        this.numProfit5 = numProfit5;
        this.numProfit10 = numProfit10;
        this.numProfit50 = numProfit50;
        this.numProfit100 = numProfit100;
        this.volume = volume;
    }

}