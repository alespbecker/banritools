Generic list item with leading visual, title/subtitle and trailing slot. Pass `onClick` to make it an interactive button (hover state, chevron-friendly).

```jsx
<ListRow
  leading={<span className="bt-icontile bt-icontile--purple"><Icon name="package" size={18} /></span>}
  title="Seguro Vida" subtitle="Seguros · 50 pts/unidade"
  trailing={<Badge variant="success" dot>Preenchido</Badge>}
  onClick={() => {}}
/>
```

Stack rows in a `Card padding="none"`; rows auto-divide with a top border.
