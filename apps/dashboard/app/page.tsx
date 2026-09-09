import { Button } from "@rf-intelligence/ui";

export default function DashboardPage() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 600, marginBottom: "1rem" }}>
        RF Intelligence Dashboard
      </h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: "2rem" }}>
        Client dashboard — under construction. This is the apps/dashboard workspace
        in the Turborepo monorepo.
      </p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Button variant="primary">Primary Action</Button>
        <Button variant="secondary">Secondary Action</Button>
        <Button variant="ghost">Ghost Button</Button>
        <Button variant="outline">Outline Button</Button>
      </div>
    </div>
  );
}