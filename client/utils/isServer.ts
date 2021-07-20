// if it is undefined it means i am on the server
// otherwise i am on the browser
export const isServer = () => typeof window === "undefined";