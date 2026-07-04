Primary action control — use for the single most important action in a view; solid fill is the AA-safe `--primary-strong` (#0077DB), never raw #0094FF.

```jsx
<Button variant="primary" iconLeft={<Icon name="save" size={16} />}>
  Salvar lançamento
</Button>
```

Variants: `primary` (solid blue CTA), `secondary` (outline), `ghost` (text/link), `navy` (deep brand fill), `danger` (destructive). Sizes `sm | md | lg`. Props: `block`, `loading`, `disabled`, `iconLeft`, `iconRight`. One primary per view; pair with `secondary`/`ghost` for lesser actions.
