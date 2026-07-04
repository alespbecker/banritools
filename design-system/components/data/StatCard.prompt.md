Dashboard KPI tile: uppercase label, big Exo 2 value (tabular-nums), corner icon tile and an optional trend badge.

```jsx
<StatCard
  label="ENGAJAMENTO" value="0%" sub="0 de 1 ativos"
  icon={<Icon name="activity" size={20} />} iconColor="brand"
  trend={<Badge variant="success">+12%</Badge>}
/>
```

`iconColor`: `brand | success | purple | turquoise | warning`. Compose 2-up or 4-up in a grid for a dashboard.
