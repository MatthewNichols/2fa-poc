import { Totp, generateConfig } from "time2fa";
import { IUser } from "./db/fake-db";

const TIME_PERIOD = 300;
const ISSUER = "Gloria";
const totpConfig = generateConfig({ period: TIME_PERIOD });

export function add2FA(user: IUser): IUser {
  // const config = generateConfig();
  const totpKey = Totp.generateKey({ issuer: ISSUER, user: user.username }, totpConfig);
  //const passcodes = Totp.generatePasscodes({ secret: totpKey.secret }, totpConfig);
  return {
    ...user,
    issuer: totpKey.issuer,
    config: totpConfig,
    secret: totpKey.secret,
    url: totpKey.url,
    twoFAuthConfigConfirmed: false,
    //passcodes: passcodes,
  }
}