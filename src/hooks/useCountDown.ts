import { useEffect, useRef, useState } from 'react';
import useGetState from 'redux/state/useGetState';
const MILLISECOND_CONVERT_SECOND = 1000;
const SECOND_CONVERT_HOUR = 60 * 60;

export default function useCountdown() {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const interval = useRef<number | null>(null);

  const { gameSetting } = useGetState();

  const resetHours = gameSetting?.dailyPlayCountResetHours;

  useEffect(() => {
    interval.current = window.setInterval(() => {
      const { hours, minutes, seconds } = getCountDown(resetHours || 0);
      setHours(hours);
      setMinutes(minutes);
      setSeconds(seconds);
    }, 1000);
    return () => {
      interval.current && window.clearInterval(interval.current);
    };
  }, [resetHours]);
  return {
    hours,
    minutes,
    seconds,
  };
}

function getCountDown(resetHours: number) {
  let now = new Date().getTime();

  now = convertToUtcTimestamp(now);

  const nowDate = new Date(now);

  const tomorrow = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate() + 1, resetHours);

  const timeDiff = tomorrow.getTime() - now;

  const seconds = Math.floor(timeDiff / MILLISECOND_CONVERT_SECOND);

  let hours = Math.floor(seconds / SECOND_CONVERT_HOUR);

  const minutes = Math.floor((seconds % SECOND_CONVERT_HOUR) / 60);
  const remainingSeconds = seconds % 60;

  if (hours >= 24) {
    hours -= 24;
  }

  return {
    hours: hours,
    minutes: minutes,
    seconds: remainingSeconds,
  };
}

export function convertToUtcTimestamp(timestamp: number) {
  const date = new Date(timestamp);
  const offset = date.getTimezoneOffset() * 60 * MILLISECOND_CONVERT_SECOND;

  const utcTimestamp = timestamp + offset;
  return utcTimestamp;
}
