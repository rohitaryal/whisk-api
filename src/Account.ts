import type { Session } from "./Types";

export default class Account {
    session: Session | null;
    readonly cookie: string;

    constructor(cookie: string) {
        if (!(cookie?.trim())) {
            throw new Error("invalid cookie")
        }

        this.session = null;
        this.cookie = cookie;
    }

    async refresh(): Promise<Session> {
        // Make a request with cookie
        const response = await fetch("https://labs.google/fx/api/auth/session", {
            method: "GET",
            headers: { cookie: this.cookie }
        });

        if (response.status != 200) {
            console.error(await response.text())
            throw new Error("failed to fetch session info")
        }

        const sessionPayload = await response.json() as Session;

        // Check if response is valid and has access_token
        if (sessionPayload && !(sessionPayload.access_token?.trim())) {
            console.error(sessionPayload);
            throw new Error("session payload is missing access token")
        }

        // Assign session
        this.session = sessionPayload;

        return this.session;
    }

    isExpired(): boolean {
        // Check if everything is ok
        if (!this.session || !(this.session.access_token?.trim()) || !(this.session.expires)) {
            return true;
        }

        // Get time in seconds
        const expiryDate = new Date(this.session.expires).getTime();
        if (!expiryDate) {
            return true;
        }

        // is current time greater than expiry time?
        return Date.now() > expiryDate;
    }

    toString(): string {
        if (!this.session) {
            return ""
        }

        return JSON.stringify(this.session)
    }
}
