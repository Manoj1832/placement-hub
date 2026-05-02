import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: "https://fine-seal-23.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
