// Generate a passcode and verify it, and try and verify a passcode that is not valid
import { Totp, generateConfig } from "time2fa";

console.log("Generating key...");
const totpKey = Totp.generateKey({ issuer: "N0C", user: "johndoe@n0c.com" });
console.log(totpKey);

console.log("Generating passcode...");
const config = generateConfig();
const passcodes = Totp.generatePasscodes({ secret: totpKey.secret }, config);
console.log(passcodes);

console.log("Verifying passcode...");
const valid = Totp.validate({ secret: totpKey.secret, passcode: passcodes[0] });
console.log(valid);

console.log("Verifying invalid passcode...");
const invalid = Totp.validate({ secret: totpKey.secret, passcode: "123456" });
console.log(invalid);

console.log("Verifying passcode again...");
const valid2 = Totp.validate({ secret: totpKey.secret, passcode: passcodes[0] });
console.log(valid2);