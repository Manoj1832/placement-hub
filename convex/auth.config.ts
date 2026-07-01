import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: "https://strong-corgi-51.clerk.accounts.dev",
      applicationID: "convex",
    },
    {
      domain: "https://strong-corgi-51.clerk.accounts.dev/",
      applicationID: "convex",
    },
    {
      domain: "https://clerk.strong-corgi-51.clerk.accounts.dev",
      applicationID: "convex",
    },
    {
      domain: "https://clerk.strong-corgi-51.clerk.accounts.dev/",
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
