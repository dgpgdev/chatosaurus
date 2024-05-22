/**
 * Utility function to pause execution for a specified duration.
 */
export class Sleep {
  /**
   * Pauses execution for a specified number of milliseconds.
   * @param ms Number of milliseconds to sleep.
   */
  static milliseconds(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Pauses execution for a specified number of seconds.
   * @param seconds Number of seconds to sleep.
   */
  static seconds(seconds: number): Promise<void> {
    return Sleep.milliseconds(seconds * 1000)
  }

  /**
   * Pauses execution for a specified number of minutes.
   * @param minutes Number of minutes to sleep.
   */
  static minutes(minutes: number): Promise<void> {
    return Sleep.seconds(minutes * 60)
  }

  /**
   * Pauses execution for a specified number of hours.
   * @param hours Number of hours to sleep.
   */
  static hours(hours: number): Promise<void> {
    return Sleep.minutes(hours * 60)
  }

  /**
   * Pauses execution for a random number of milliseconds between 0 and the specified maximum.
   * @param maxMs Maximum number of milliseconds to sleep.
   */
  static randomMilliseconds(maxMs: number): Promise<void> {
    const ms = Math.floor(Math.random() * maxMs)
    return Sleep.milliseconds(ms)
  }

  /**
   * Pauses execution for a random number of seconds between 0 and the specified maximum.
   * @param maxSeconds Maximum number of seconds to sleep.
   */
  static randomSeconds(maxSeconds: number): Promise<void> {
    const seconds = Math.floor(Math.random() * maxSeconds)
    return Sleep.seconds(seconds)
  }

  /**
   * Pauses execution for a random number of minutes between 0 and the specified maximum.
   * @param maxMinutes Maximum number of minutes to sleep.
   */
  static randomMinutes(maxMinutes: number): Promise<void> {
    const minutes = Math.floor(Math.random() * maxMinutes)
    return Sleep.minutes(minutes)
  }

  /**
   * Pauses execution for a random number of hours between 0 and the specified maximum.
   * @param maxHours Maximum number of hours to sleep.
   */
  static randomHours(maxHours: number): Promise<void> {
    const hours = Math.floor(Math.random() * maxHours)
    return Sleep.hours(hours)
  }

  /**
   * Pauses execution for a random duration between the specified range in milliseconds.
   * @param minMs Minimum number of milliseconds to sleep.
   * @param maxMs Maximum number of milliseconds to sleep.
   */
  static randomBetweenMilliseconds(
    minMs: number,
    maxMs: number
  ): Promise<void> {
    const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs
    return Sleep.milliseconds(ms)
  }

  /**
   * Pauses execution for a random duration between the specified range in seconds.
   * @param minSeconds Minimum number of seconds to sleep.
   * @param maxSeconds Maximum number of seconds to sleep.
   */
  static randomBetweenSeconds(
    minSeconds: number,
    maxSeconds: number
  ): Promise<void> {
    const seconds =
      Math.floor(Math.random() * (maxSeconds - minSeconds + 1)) + minSeconds
    return Sleep.seconds(seconds)
  }

  /**
   * Pauses execution for a random duration between the specified range in minutes.
   * @param minMinutes Minimum number of minutes to sleep.
   * @param maxMinutes Maximum number of minutes to sleep.
   */
  static randomBetweenMinutes(
    minMinutes: number,
    maxMinutes: number
  ): Promise<void> {
    const minutes =
      Math.floor(Math.random() * (maxMinutes - minMinutes + 1)) + minMinutes
    return Sleep.minutes(minutes)
  }

  /**
   * Pauses execution for a random duration between the specified range in hours.
   * @param minHours Minimum number of hours to sleep.
   * @param maxHours Maximum number of hours to sleep.
   */
  static randomBetweenHours(minHours: number, maxHours: number): Promise<void> {
    const hours =
      Math.floor(Math.random() * (maxHours - minHours + 1)) + minHours
    return Sleep.hours(hours)
  }
}
