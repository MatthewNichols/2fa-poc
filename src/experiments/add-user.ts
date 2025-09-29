import { Totp, generateConfig } from "time2fa";
import { IUser, saveUser, loadUsers } from "../db/fake-db";

const TIME_PERIOD = 300;

async function main() {

  await loadUsers();
  
  const user: IUser = {
    username: 'johndoe',
    password: 'password1',
  };
  
  await saveUser(user);

  console.log('User saved');

  console.log("Generating key...");
  
  const config = generateConfig({ period: TIME_PERIOD });
  const totpKey = Totp.generateKey({ issuer: "Gloria", user: user.username }, config);
  const passcodes = Totp.generatePasscodes({ secret: totpKey.secret }, config);
  console.log(passcodes);

  console.log("Saving user...");
  const userUpdateData: IUser = {
    ...user,
    issuer: totpKey.issuer,
    config: config,
    secret: totpKey.secret,
    url: totpKey.url,
  }

  await saveUser(userUpdateData);
  console.log('User saved');

  process.exit(0);
}

main();