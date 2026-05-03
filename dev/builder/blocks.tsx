import {
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Switch,
  Textarea,
} from '@lib'

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA TYPES

export type Control =
  | { kind: 'text'; key: string; label: string }
  | { kind: 'textarea'; key: string; label: string }
  | { kind: 'select'; key: string; label: string; options: string[] }
  | { kind: 'boolean'; key: string; label: string }

export type BlockSchema = {
  type: string
  label: string
  group: 'Form' | 'Display' | 'Content'
  defaultProps: Record<string, unknown>
  defaultSize?: { width: number; height?: number }
  render: (props: Record<string, unknown>) => React.ReactNode
  controls: Control[]
}

// ─────────────────────────────────────────────────────────────────────────────
// PALETTE

export const BLOCKS: Record<string, BlockSchema> = {
  Heading: {
    type: 'Heading',
    label: 'Heading',
    group: 'Content',
    defaultProps: { text: 'Heading', level: 'h2' },
    defaultSize: { width: 280 },
    render: ({ text, level }) => {
      const cls =
        level === 'h1'
          ? 'text-4xl font-semibold tracking-tight'
          : level === 'h3'
            ? 'text-2xl font-semibold tracking-tight'
            : level === 'h4'
              ? 'text-xl font-semibold tracking-tight'
              : 'text-3xl font-semibold tracking-tight'
      const txt = String(text ?? '')
      if (level === 'h1') return <h1 className={cls}>{txt}</h1>
      if (level === 'h3') return <h3 className={cls}>{txt}</h3>
      if (level === 'h4') return <h4 className={cls}>{txt}</h4>
      return <h2 className={cls}>{txt}</h2>
    },
    controls: [
      { kind: 'text', key: 'text', label: 'Text' },
      {
        kind: 'select',
        key: 'level',
        label: 'Level',
        options: ['h1', 'h2', 'h3', 'h4'],
      },
    ],
  },
  Paragraph: {
    type: 'Paragraph',
    label: 'Paragraph',
    group: 'Content',
    defaultProps: {
      text: 'A short paragraph of body copy. Edit me in the inspector.',
    },
    defaultSize: { width: 320 },
    render: ({ text }) => (
      <p className="text-fg text-base leading-relaxed max-w-prose">
        {String(text ?? '')}
      </p>
    ),
    controls: [{ kind: 'textarea', key: 'text', label: 'Text' }],
  },
  Button: {
    type: 'Button',
    label: 'Button',
    group: 'Form',
    defaultProps: { children: 'Click me', variant: 'default', size: 'default' },
    render: (p) => (
      <Button
        variant={p.variant as never}
        size={p.size as never}
        type="button"
      >
        {String(p.children ?? '')}
      </Button>
    ),
    controls: [
      { kind: 'text', key: 'children', label: 'Text' },
      {
        kind: 'select',
        key: 'variant',
        label: 'Variant',
        options: ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'],
      },
      {
        kind: 'select',
        key: 'size',
        label: 'Size',
        options: ['sm', 'default', 'lg'],
      },
    ],
  },
  Input: {
    type: 'Input',
    label: 'Input',
    group: 'Form',
    defaultProps: { placeholder: 'Email', type: 'text' },
    defaultSize: { width: 240 },
    render: (p) => (
      <Input
        placeholder={String(p.placeholder ?? '')}
        type={String(p.type ?? 'text')}
      />
    ),
    controls: [
      { kind: 'text', key: 'placeholder', label: 'Placeholder' },
      {
        kind: 'select',
        key: 'type',
        label: 'Type',
        options: ['text', 'email', 'password', 'number', 'search'],
      },
    ],
  },
  Textarea: {
    type: 'Textarea',
    label: 'Textarea',
    group: 'Form',
    defaultProps: { placeholder: 'Write something...' },
    defaultSize: { width: 280 },
    render: (p) => (
      <Textarea placeholder={String(p.placeholder ?? '')} rows={3} />
    ),
    controls: [{ kind: 'text', key: 'placeholder', label: 'Placeholder' }],
  },
  Select: {
    type: 'Select',
    label: 'Select',
    group: 'Form',
    defaultProps: { placeholder: 'Pick one', options: 'Apple,Banana,Cherry' },
    defaultSize: { width: 200 },
    render: (p) => {
      const opts = String(p.options ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      return (
        <Select>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={String(p.placeholder ?? '')} />
          </SelectTrigger>
          <SelectContent>
            {opts.map((o) => (
              <SelectItem key={o} value={o.toLowerCase()}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    },
    controls: [
      { kind: 'text', key: 'placeholder', label: 'Placeholder' },
      { kind: 'text', key: 'options', label: 'Options (comma-separated)' },
    ],
  },
  Checkbox: {
    type: 'Checkbox',
    label: 'Checkbox',
    group: 'Form',
    defaultProps: { label: 'I agree', checked: true },
    render: (p) => (
      <div className="flex items-center gap-2">
        <Checkbox defaultChecked={Boolean(p.checked)} />
        <Label>{String(p.label ?? '')}</Label>
      </div>
    ),
    controls: [
      { kind: 'text', key: 'label', label: 'Label' },
      { kind: 'boolean', key: 'checked', label: 'Checked' },
    ],
  },
  Switch: {
    type: 'Switch',
    label: 'Switch',
    group: 'Form',
    defaultProps: { label: 'Notifications', checked: true },
    render: (p) => (
      <div className="flex items-center gap-2">
        <Switch defaultChecked={Boolean(p.checked)} />
        <Label>{String(p.label ?? '')}</Label>
      </div>
    ),
    controls: [
      { kind: 'text', key: 'label', label: 'Label' },
      { kind: 'boolean', key: 'checked', label: 'Checked' },
    ],
  },
  Card: {
    type: 'Card',
    label: 'Card',
    group: 'Display',
    defaultProps: {
      title: 'Card title',
      description: 'Card description goes here.',
      content: 'Body content for the card. Edit in the inspector.',
    },
    defaultSize: { width: 320 },
    render: (p) => (
      <Card className="w-[320px]">
        <CardHeader>
          <CardTitle>{String(p.title ?? '')}</CardTitle>
          <CardDescription>{String(p.description ?? '')}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-fg">
          {String(p.content ?? '')}
        </CardContent>
      </Card>
    ),
    controls: [
      { kind: 'text', key: 'title', label: 'Title' },
      { kind: 'text', key: 'description', label: 'Description' },
      { kind: 'textarea', key: 'content', label: 'Content' },
    ],
  },
  Alert: {
    type: 'Alert',
    label: 'Alert',
    group: 'Display',
    defaultProps: {
      title: 'Heads up!',
      description: 'You can configure this alert in the inspector.',
      variant: 'default',
    },
    defaultSize: { width: 380 },
    render: (p) => (
      <Alert variant={p.variant as never} className="w-[380px]">
        <AlertTitle>{String(p.title ?? '')}</AlertTitle>
        <AlertDescription>{String(p.description ?? '')}</AlertDescription>
      </Alert>
    ),
    controls: [
      { kind: 'text', key: 'title', label: 'Title' },
      { kind: 'textarea', key: 'description', label: 'Description' },
      {
        kind: 'select',
        key: 'variant',
        label: 'Variant',
        options: ['default', 'destructive'],
      },
    ],
  },
  Badge: {
    type: 'Badge',
    label: 'Badge',
    group: 'Display',
    defaultProps: { children: 'Badge', variant: 'default' },
    render: (p) => (
      <Badge variant={p.variant as never}>{String(p.children ?? '')}</Badge>
    ),
    controls: [
      { kind: 'text', key: 'children', label: 'Text' },
      {
        kind: 'select',
        key: 'variant',
        label: 'Variant',
        options: ['default', 'secondary', 'destructive', 'outline'],
      },
    ],
  },
  Avatar: {
    type: 'Avatar',
    label: 'Avatar',
    group: 'Display',
    defaultProps: { fallback: 'JR' },
    render: (p) => (
      <Avatar>
        <AvatarFallback>{String(p.fallback ?? 'AB')}</AvatarFallback>
      </Avatar>
    ),
    controls: [{ kind: 'text', key: 'fallback', label: 'Initials' }],
  },
  Separator: {
    type: 'Separator',
    label: 'Separator',
    group: 'Display',
    defaultProps: { orientation: 'horizontal' },
    defaultSize: { width: 240 },
    render: (p) => (
      <div
        className={
          p.orientation === 'vertical'
            ? 'flex h-16 items-center'
            : 'w-[240px]'
        }
      >
        <Separator orientation={p.orientation as 'horizontal' | 'vertical'} />
      </div>
    ),
    controls: [
      {
        kind: 'select',
        key: 'orientation',
        label: 'Orientation',
        options: ['horizontal', 'vertical'],
      },
    ],
  },
}

export const BLOCK_GROUPS: Array<{ label: string; types: string[] }> = [
  {
    label: 'Content',
    types: ['Heading', 'Paragraph'],
  },
  {
    label: 'Form',
    types: ['Button', 'Input', 'Textarea', 'Select', 'Checkbox', 'Switch'],
  },
  {
    label: 'Display',
    types: ['Card', 'Alert', 'Badge', 'Avatar', 'Separator'],
  },
]
