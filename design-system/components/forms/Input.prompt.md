Text field with optional label, leading icon, helper and error states.

```jsx
<Input label="Valor (R$)" icon={<Icon name="dollar-sign" size={16} />} placeholder="0,00" />
<Input label="E-mail" error="E-mail inválido" defaultValue="x@" />
```

Props: `label`, `optional`, `icon`, `helper`, `error`, plus all native input attrs. Omit `label` to get the bare control for custom layouts.
