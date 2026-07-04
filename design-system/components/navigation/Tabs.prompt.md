Underline tab bar for switching panels within a page (e.g. a product editor).

```jsx
<Tabs
  value={tab} onChange={setTab}
  items={[
    { value: "info", label: "Informações" },
    { value: "var", label: "Variantes (5)" },
    { value: "campos", label: "Esquema de campos" },
  ]}
/>
```

Active tab uses a `--primary` underline + `--link` label.
