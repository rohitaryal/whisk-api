import { Account } from "../src/Whisk";
import { expect, test } from "bun:test";

const cookie = process.env.COOKIE;

test.if(!!cookie)("Generate auth token", async () => {
    const account = new Account(process.env.COOKIE!);

    expect(account.isExpired()).toBeTrue()

    await account.refresh()

    expect(account.isExpired()).toBeFalse()

    expect(await account.getToken()).toBeDefined()
});

test.if(!!cookie)("Invalid cookie authentication", async () => {
    const account = new Account("HI_MIDDLEWARE_I_AM_NOT_A_VALID_COOKIE");

    try {
        await account.refresh()
        throw new Error("shouldnt have passed with valid cookie")
    } catch { }

    expect(account.isExpired()).toBeTrue()
});
