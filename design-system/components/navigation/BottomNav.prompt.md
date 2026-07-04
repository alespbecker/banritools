Mobile bottom tab bar (3-5 destinations). Active item is tinted `--primary`.

```jsx
<BottomNav
  value={tab} onChange={setTab}
  items={[
    { value: "inicio", label: "Início", icon: <Icon name="house" size={22} /> },
    { value: "registrar", label: "Registrar", icon: <Icon name="square-pen" size={22} /> },
    { value: "ranking", label: "Ranking", icon: <Icon name="trophy" size={22} /> },
    { value: "metas", label: "Metas", icon: <Icon name="target" size={22} /> },
  ]}
/>
```
