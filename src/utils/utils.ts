const width = (window.innerWidth > 0) ? window.innerWidth : window.screen.height;
export const isMobile = width < 768;
export const getTokenFromMint = (mint: string) => {
    const mintToTokenMap: any = {
        'So11111111111111111111111111111111111111112': 'SOL'
    }
    if (Object.hasOwn(mintToTokenMap, mint)) {
        return(mintToTokenMap[mint]);
    }
    return(mint);
}