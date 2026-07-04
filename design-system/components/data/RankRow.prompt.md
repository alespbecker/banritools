Leaderboard row: position medal (1/2/3 tinted), avatar, name, points, role tags and an optional progress bar. Use `me` to highlight the viewer.

```jsx
<RankRow
  position={1} name="Alessandro Becker" points="9.150 pts" me
  avatar={<Avatar name="Alessandro Becker" />}
  tags={<><Badge variant="brand">Você</Badge><Badge variant="warning">Líder</Badge></>}
  progress={<ProgressBar value={100} variant="warning" />}
/>
```

Stack rows inside a `Card padding="none"`.
