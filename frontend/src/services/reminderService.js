// Reminder service for notifying users when they need to leave their bar
// Uses browser notifications and can be extended to support SMS

const DEFAULT_BAR_DURATION = 30 * 60 * 1000 // 30 minutes in milliseconds
const REMINDER_CHECK_INTERVAL = 60 * 1000 // Check every minute

let reminderIntervals = new Map() // Track intervals per user

// Request browser notification permission
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

// Send a browser notification
function sendBrowserNotification(title, options = {}) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/favicon.ico', // You can customize this
      badge: '/favicon.ico',
      ...options
    })
  }
}

// Send SMS reminder (placeholder - would need backend integration)
async function sendSMSReminder(phoneNumber, message) {
  // This would call your backend API to send SMS
  // Example:
  // await fetch('/api/send-sms', {
  //   method: 'POST',
  //   body: JSON.stringify({ phoneNumber, message })
  // })
  console.log(`SMS reminder would be sent to ${phoneNumber}: ${message}`)
}

// Start monitoring a user's bar visit
export function startReminderMonitoring(userId, phoneNumber, barName, barDuration = DEFAULT_BAR_DURATION) {
  // Stop any existing monitoring for this user
  stopReminderMonitoring(userId)

  // Request notification permission (fire and forget)
  // Note: requestNotificationPermission is in the same file, so it's available
  if (typeof requestNotificationPermission === 'function') {
    requestNotificationPermission().catch(err => {
      console.warn('Failed to request notification permission:', err)
    })
  }

  const startTime = Date.now()
  const reminderTime = startTime + barDuration

  // Check periodically if it's time to remind
  const interval = setInterval(() => {
    const now = Date.now()
    const timeRemaining = reminderTime - now

    // Send reminder 5 minutes before time is up
    if (timeRemaining <= 5 * 60 * 1000 && timeRemaining > 4 * 60 * 1000) {
      const message = `⏰ Reminder: You should start thinking about leaving ${barName} soon!`
      
      // Browser notification
      sendBrowserNotification('Bar Crawl Reminder', {
        body: message,
        tag: `bar-reminder-${userId}`,
        requireInteraction: false
      })

      // SMS reminder (if phone number provided)
      if (phoneNumber) {
        sendSMSReminder(phoneNumber, message)
      }
    }

    // Send final reminder when time is up
    if (timeRemaining <= 0 && timeRemaining > -60 * 1000) {
      const message = `🚨 Time's up! Please leave ${barName} and head to your next bar.`
      
      // Browser notification
      sendBrowserNotification('Time to Leave!', {
        body: message,
        tag: `bar-reminder-${userId}`,
        requireInteraction: true
      })

      // SMS reminder
      if (phoneNumber) {
        sendSMSReminder(phoneNumber, message)
      }
    }
  }, REMINDER_CHECK_INTERVAL)

  reminderIntervals.set(userId, interval)
}

// Stop monitoring reminders for a user
export function stopReminderMonitoring(userId) {
  const interval = reminderIntervals.get(userId)
  if (interval) {
    clearInterval(interval)
    reminderIntervals.delete(userId)
  }
}

// Get time remaining at current bar (in milliseconds)
export function getTimeRemainingAtBar(userId, startTime, barDuration = DEFAULT_BAR_DURATION) {
  const now = Date.now()
  const elapsed = now - startTime
  return Math.max(0, barDuration - elapsed)
}

// Format time remaining as human-readable string
export function formatTimeRemaining(ms) {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
}

