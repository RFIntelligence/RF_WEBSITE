import { describe, expect, it } from "vitest";
import { orgChannel, parseOrganizationFromChannel } from "./channels";

describe("orgChannel", () => {
  it("scopes the channel to the organization", () => {
    expect(orgChannel("org_acme", "messages")).toBe("rf-intel:org:org_acme:messages");
    expect(orgChannel("org_acme", "notifications")).toBe(
      "rf-intel:org:org_acme:notifications",
    );
  });
});

describe("parseOrganizationFromChannel", () => {
  it("extracts the organization from a scoped channel", () => {
    expect(parseOrganizationFromChannel("rf-intel:org:org_acme:messages")).toBe("org_acme");
  });

  it("returns null for an unrecognised channel", () => {
    expect(parseOrganizationFromChannel("public:chat")).toBeNull();
    expect(parseOrganizationFromChannel("rf-intel:org:org_acme")).toBeNull();
  });
});
