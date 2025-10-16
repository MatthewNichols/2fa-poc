// Pretend Message channel to the user

/*

    Black: \x1b[30m
    Red: \x1b[31m
    Green: \x1b[32m
    Yellow: \x1b[33m
    Blue: \x1b[34m
    Magenta: \x1b[35m
    Cyan: \x1b[36m
    White: \x1b[37m

*/

const consoleColors = {
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

function sendColoredMessage(message: string, color: keyof typeof consoleColors) {
  console.log(`${consoleColors[color]}${message}${consoleColors.reset}`);
}

export function sendMessage(message: string) {
  sendColoredMessage(`**** Sending Fake Message to USER: ${message}`, 'green');
}

export function sendOTP(otp: string) {
  sendColoredMessage(`**** Fake OTP to USER: ${otp}`, 'yellow');
}