Compact pill toggle for 2-3 short, mutually-exclusive options.

```jsx
<SegmentedControl
  value={range} onChange={setRange}
  items={[{value:"mes",label:"Mês"},{value:"tri",label:"Trimestre"},{value:"ano",label:"Ano"}]}
/>
```

For many/long options use Tabs or Select instead.
