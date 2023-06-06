import { IState } from "src/store/interfaces/state";
import { Slide } from "../models/Slide";

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

export const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
  
    // Get the day of the week (e.g., "Wed")
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOfWeek = daysOfWeek[date.getDay()];
  
    // Get the month (e.g., "Jun")
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const month = months[date.getMonth()];
  
    // Get the day of the month (e.g., 10th, 1st, 2nd, etc.)
    const day = date.getDate();
    const suffix = getNumberSuffix(day); // Get the appropriate suffix for the day
  
    // Get the hour (e.g., 9) and AM/PM indicator
    let hour = date.getHours();
    const amPm = hour >= 12 ? 'pm' : 'am';
    hour = hour % 12 || 12; // Convert to 12-hour format

    return `${dayOfWeek} ${month} ${day}${suffix} ${hour}${amPm}`;
  }
  
  const getNumberSuffix = (number: number) => {
    if (number >= 11 && number <= 13) {
      return 'th';
    }
  
    const lastDigit = number % 10;
  
    switch (lastDigit) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }
  