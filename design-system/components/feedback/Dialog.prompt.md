Centered modal dialog over a navy backdrop. Renders null when `open` is false.

```jsx
<Dialog
  open={open} title="Confirmar lançamento" onClose={() => setOpen(false)}
  footer={<>
    <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
    <Button variant="primary">Salvar</Button>
  </>}
>
  Você está prestes a lançar R$ 50,00 em Seguro Vida (+2.550 pts).
</Dialog>
```
