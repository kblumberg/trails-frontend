import { MadTrailScorecard } from "../models/MadTrailScorecard";

const width = (window.innerWidth > 0) ? window.innerWidth : window.screen.height;
export const isMobile = width < 768;

export const getCurrentTimestamp = () => {
    return(new Date().getTime())
}

export const getXpFromMadWarsScorecard = (s: MadTrailScorecard) => {
    return(
        (s.hasApt ? 10 : 0)
        + (s.hasArb ? 10 : 0)
        + (s.hasBtc ? 10 : 0)
        + (s.hasEth ? 10 : 0)
        + (s.hasLong ? 10 : 0)
        + (s.hasShort ? 10 : 0)
        + (s.hasSol ? 10 : 0)
        + (s.numProfit1 * 10)
        + (s.numProfit5 * 20)
        + (s.numProfit10 * 30)
        + (s.numProfit50 * 40)
        + (s.numProfit100 * 50)
        + (s.numVolume10 * 10)
        + (s.numVolume50 * 20)
        + (s.numVolume100 * 30)
        + (s.numVolume500 * 40)
        + (s.numVolume1000 * 50)
    )
}