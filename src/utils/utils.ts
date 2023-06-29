import { MadTrailScorecard } from "../models/MadTrailScorecard";

const width = (window.innerWidth > 0) ? window.innerWidth : window.screen.height;
export const isMobile = width < 768;

export const getCurrentTimestamp = () => {
    return(new Date().getTime())
}

export const getXpFromMadWarsScorecard = (s: MadTrailScorecard) => {
    const amt = Math.min(1000000, s.volume);
    const xp = (
        (s.hasApt ? 10 : 0)
        + (s.hasArb ? 10 : 0)
        + (s.hasBtc ? 10 : 0)
        + (s.hasEth ? 10 : 0)
        + (s.hasLong ? 10 : 0)
        + (s.hasShort ? 10 : 0)
        + (s.hasSol ? 10 : 0)
        // + (s.numProfit1 * 5)
        // + (s.numProfit5 * 10)
        // + (s.numProfit10 * 20)
        // + (s.numProfit50 * 50)
        // + (s.numProfit100 * 100)
        // + (Math.min(3, s.numVolume10) * 5)
        // + (Math.min(3, s.numVolume50) * 10)
        // + (Math.min(3, s.numVolume100) * 20)
        // + (Math.min(3, s.numVolume500) * 50)
        // + (Math.min(3, s.numVolume1000) * 100)
        + Math.floor(amt / 1000)
        + Math.floor(Math.max(0, Math.log10(amt))) * 15
    )
    return(xp);
}


export const ordinal_suffix_of = (i: number) => {
    const j = i % 10, k = i % 100;
    if (j == 1 && k != 11) {
        return(i + 'st');
    }
    if (j == 2 && k != 12) {
        return(i + 'nd');
    }
    if (j == 3 && k != 13) {
        return(i + 'rd');
    }
    return(i + 'th');
}