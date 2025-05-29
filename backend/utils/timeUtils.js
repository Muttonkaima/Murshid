/**
 * Calculates the time elapsed since the given date and returns it in a human-readable format
 * @param {Date} date - The date to calculate time elapsed from
 * @returns {string} - A human-readable string representing the time elapsed
 */
const getTimeAgo = (date) => {
  // Convert stored UTC date to a Date object
  const quizDate = new Date(date);
  const nowUTC = new Date();

  // Convert both times to IST
  const localNow = new Date(nowUTC.getTime() + (5.5 * 60 * 60 * 1000)); 

  // Calculate the difference in milliseconds
  const differenceInMilliseconds = localNow - quizDate;
  
  const seconds = Math.floor(differenceInMilliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(seconds / 3600);
  const days = Math.floor(seconds / 86400);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
};

module.exports = {
  getTimeAgo
};
