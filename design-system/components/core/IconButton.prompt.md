Square label-less control for app-bar and toolbar actions; always pass `aria-label`.

```jsx
<IconButton aria-label="Notificações" variant="subtle">
  <Icon name="bell" size={20} />
</IconButton>
```

Variants `subtle | solid`. Sizes `sm | md | lg` (use `lg` = 44px for mobile touch targets).
